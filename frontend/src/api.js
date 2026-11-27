const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

async function rawRequest(path, options = {}, token = null) {
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = "Bearer " + token;
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  const response = await fetch(API_BASE + path, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body,
  });

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = data?.detail || data?.message || data?.non_field_errors?.[0] || "Request failed. Please try again.";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function request(path, options = {}) {
  const access = localStorage.getItem("housemates_access");
  try {
    return await rawRequest(path, options, access);
  } catch (error) {
    if (error.status !== 401 || path === "/auth/token/refresh/") throw error;
    const refresh = localStorage.getItem("housemates_refresh");
    if (!refresh) throw error;
    try {
      const tokens = await rawRequest("/auth/token/refresh/", { method: "POST", body: { refresh } });
      localStorage.setItem("housemates_access", tokens.access);
      return await rawRequest(path, options, tokens.access);
    } catch (refreshError) {
      localStorage.removeItem("housemates_access");
      localStorage.removeItem("housemates_refresh");
      throw refreshError;
    }
  }
}

const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
