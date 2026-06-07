import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const API_BASE_URL = "http://localhost:8081";

export const TOKEN_KEY = "garageos_token";
export const USER_KEY = "garageos_user";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/register"];

function isPublicAuthRequest(url = "") {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirectToLogin(message?: string) {
  if (!window.location.pathname.startsWith("/login")) {
    if (message) toast.error(message);
    window.location.href = "/login";
  }
}

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  if (!isPublicAuthRequest(config.url)) {
    clearStoredSession();
    redirectToLogin("Please sign in to continue.");
    return Promise.reject(
      new AxiosError("Authentication token missing", "ERR_AUTH_REQUIRED", config),
    );
  }

  return config;
});

// Response interceptor — normalize errors, handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;

      if (status === 401) {
        clearStoredSession();
        redirectToLogin("Session expired. Please sign in again.");
      } else if (status && status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Cannot reach server. Is the backend running?");
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown, fallback = "Request failed") {
  const ax = error as AxiosError<any>;
  const data = ax?.response?.data;
  return (
    (typeof data === "string" ? data : undefined) ||
    data?.message ||
    data?.error ||
    ax?.message ||
    fallback
  );
}
