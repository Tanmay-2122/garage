import { api, TOKEN_KEY, USER_KEY } from "@/lib/api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  role?: string;
}

export interface AuthUser {
  id?: number | string;
  username: string;
  role?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

function parseAuthResponse(data: any, fallbackUsername: string): AuthSession {
  const payload = typeof data === "string" ? JSON.parse(data) : data;
  const token = payload?.token || payload?.jwt || payload?.accessToken;

  if (!token || typeof token !== "string") {
    throw new Error("Authentication token missing from server response.");
  }

  const responseUser = payload?.user ?? payload;
  const user: AuthUser = {
    id: responseUser?.id,
    username: responseUser?.username || fallbackUsername,
    role: responseUser?.role,
  };

  return { token, user };
}

function storeSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  return session;
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post("/auth/login", payload);
    return storeSession(parseAuthResponse(data, payload.username));
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post("/auth/register", payload);
    return storeSession(parseAuthResponse(data, payload.username));
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  saveSession(session: AuthSession) {
    return storeSession(session);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY) && !!localStorage.getItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !token) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
};
