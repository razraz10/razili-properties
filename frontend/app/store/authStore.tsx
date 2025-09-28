import { create } from "zustand";
import axios from "../lib/axiosInstance";
import axiosSelf from "../lib/axiosInstance";

export interface AuthUser {
  id?: string;
  user_name?: string;
  email?: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  tokenExpiryTime: number | null;
  _refreshInterval?: NodeJS.Timeout | null;
  initialize: () => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  startRefreshTimer: () => void;
  updateUser: (update: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  tokenExpiryTime: null,
  _refreshInterval: null,

  initialize: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedExpiry = localStorage.getItem("tokenExpiryTime");

    if (storedUser && storedToken && storedExpiry) {
      set({
        user: JSON.parse(storedUser),
        token: storedToken,
        tokenExpiryTime: parseInt(storedExpiry),
      });
      get().startRefreshTimer();
    }
  },

  login: (user, token) => {
    const expiry = Date.now() + 55 * 60 * 1000;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiryTime", expiry.toString());
    set({ user, token, tokenExpiryTime: expiry });
    get().startRefreshTimer();
  },

  logout: async () => {
    try {
      await axiosSelf.post("/auth/logout");
    } catch {}
    clearInterval(get()._refreshInterval!);
    localStorage.clear();
    set({ user: null, token: null, tokenExpiryTime: null, _refreshInterval: null });
  },

refreshToken: async () => {
  try {
    const { data } = await axiosSelf.post("/auth/refresh", {}, { withCredentials: true });
    const expiry = Date.now() + 55 * 60 * 1000;
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("tokenExpiryTime", expiry.toString());
    set({ token: data.accessToken, user: data.user, tokenExpiryTime: expiry });
    return data.accessToken;
  } catch (err) {
    if (typeof err === "object" && err !== null && "response" in err) {
      // @ts-ignore
      console.error("Refresh token failed:", err.response?.data || err);
    } else {
      console.error("Refresh token failed:", err);
    }
    await get().logout(); // מחליף את ה-set ב-logout כדי לנקות גם את interval
    return null;
  }
},



  startRefreshTimer: () => {
    if (get()._refreshInterval !== null && get()._refreshInterval !== undefined) {
      clearInterval(get()._refreshInterval as NodeJS.Timeout);
    }
    const interval = setInterval(async () => {
      const { tokenExpiryTime } = get();
      if (!tokenExpiryTime) return;
      if (tokenExpiryTime - Date.now() < 5 * 60 * 1000) {
        await get().refreshToken();
      }
    }, 60 * 1000);
    set({ _refreshInterval: interval });
  },

  updateUser: (update) => {
    set((state) => {
      const updated = { ...state.user, ...update };
      localStorage.setItem("user", JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
