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

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

export async function apiRequest(
  path,
  { method = "GET", query, headers, body, signal } = {}
) {
  const url = new URL(path, API_BASE_URL || window.location.origin);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
  }

  const isFormData = body instanceof FormData;
  
  const getRequestInit = (customHeaders = {}) => ({
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
      ...customHeaders,
      ...(headers || {}),
    },
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
    signal,
    credentials: "include",
  });

  let res;
  try { 
    res = await fetch(url.toString(), getRequestInit()); 
  } catch (e) { 
    throw new ApiError("Network error. Please try again.", { details: e }); 
  }

  // ─── Handle 401 (Unauthorized) ───
  if (res.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    const refreshToken = localStorage.getItem('auth-refresh-token');
    
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          console.log("Token expired. Attempting refresh...");
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.token || refreshData.accessToken;
            
            localStorage.setItem('auth-token', newToken);
            if (refreshData.refreshToken) {
              localStorage.setItem('auth-refresh-token', refreshData.refreshToken);
            }

            isRefreshing = false;
            onTokenRefreshed(newToken);
          } else {
            // Refresh failed — clear session
            isRefreshing = false;
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-refresh-token');
            localStorage.removeItem('auth-user');
            window.location.href = "/auth";
            throw new ApiError("Session expired. Please login again.");
          }
        } catch (err) {
          isRefreshing = false;
          throw err;
        }
      }

      // Queue this request until refresh completes
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          resolve(apiRequest(path, { method, query, headers: { ...headers, Authorization: `Bearer ${newToken}` }, body, signal }));
        });
      });
    }
  }

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