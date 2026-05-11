const fromVite = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) || "";
const fromCra = (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) || "";

export const API_BASE_URL = (fromVite || fromCra || "http://localhost:8080").replace(/\/+$/, "");

// When true, domain APIs use local mock implementations (current fakeApi/localStorage).
// Set this to "false" once your backend endpoints are ready.
export const USE_MOCK_API =
  (
    (
      (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_USE_MOCK_API) ||
      (typeof process !== "undefined" && process.env && process.env.REACT_APP_USE_MOCK_API) ||
      ""
    ).toLowerCase() === "true"
  ) || !API_BASE_URL;

