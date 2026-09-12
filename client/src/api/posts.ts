import { api } from "./client";
import type { BoardType, Post, PostCreateInput, PostUpdateInput } from "../types";

export const postsApi = {
  list: (boardType: BoardType) => api.get<Post[]>(`/posts?boardType=${boardType}`),
  get: (id: number | string) => api.get<Post>(`/posts/${id}`),
  create: (data: PostCreateInput) => api.post<Post>("/posts", data),
  update: (id: number | string, data: PostUpdateInput) =>
    api.put<Post>(`/posts/${id}`, data),
  remove: (id: number | string, guestPassword?: string) =>
    api.delete<void>(`/posts/${id}`, guestPassword ? { guestPassword } : undefined),
};
