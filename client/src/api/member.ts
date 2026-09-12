import { api } from "./client";
import type { Member } from "../types";

export const memberApi = {
  register: (email: string, name: string, password: string) =>
    api.post<Member>("/members/register", { email, name, password }),
  login: (email: string, password: string) =>
    api.post<Member>("/members/login", { email, password }),
  logout: () => api.post<void>("/members/logout"),
  me: () => api.get<Member>("/members/me"),
};
