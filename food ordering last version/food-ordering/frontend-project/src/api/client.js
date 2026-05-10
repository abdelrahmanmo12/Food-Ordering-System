// api/client.js
import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";

console.log("API_BASE_URL =", API_BASE_URL);
async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); }
  catch { return text; }
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth-token');
  const raw   = localStorage.getItem('auth-user');
  const user  = raw ? JSON.parse(raw) : null;

  return {
    ...(token        ? { Authorization:  `Bearer ${token}` }       : {}),
    ...(user?.id     ? { "X-User-Id":     String(user.id) }        : {}),
    ...(user?.role   ? { "X-User-Role":   user.role.toUpperCase() } : {}),
    ...(user?.status ? { "X-User-Status": user.status }            : {}),
  };
}

export async function apiRequest(
  path,
  { method = "GET", query, headers, body, signal } = {}
) {
  const url = new URL(API_BASE_URL + path);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }

  const init = {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),  // token + X-User-Id + X-User-Role + X-User-Status
      ...(headers || {}),   // per-call overrides come last
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    credentials: "include",
  };

  let res;
  try { res = await fetch(url.toString(), init); }
  catch (e) { throw new ApiError("Network error. Please try again.", { details: e }); }

  const data = await parseJsonSafely(res);
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, { status: res.status, details: data });
  }
  return data;
}

export const api = {
  get:   (path, opts)       => apiRequest(path, { ...(opts || {}), method: "GET" }),
  post:  (path, body, opts) => apiRequest(path, { ...(opts || {}), method: "POST",   body }),
  put:   (path, body, opts) => apiRequest(path, { ...(opts || {}), method: "PUT",    body }),
  patch: (path, body, opts) => apiRequest(path, { ...(opts || {}), method: "PATCH",  body }),
  del:   (path, opts)       => apiRequest(path, { ...(opts || {}), method: "DELETE" }),
};