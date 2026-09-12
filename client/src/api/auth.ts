import { api } from "./client";
import type { AdminUser } from "../types";

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AdminUser>("/auth/login", { username, password }),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<AdminUser>("/auth/me"),
};
