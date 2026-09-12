import { api } from "./client";
import type { Comment } from "../types";

export const commentsApi = {
  list: (postId: number | string) => api.get<Comment[]>(`/posts/${postId}/comments`),
  create: (postId: number | string, data: { content: string; author?: string }) =>
    api.post<Comment>(`/posts/${postId}/comments`, data),
  remove: (postId: number | string, commentId: number | string) =>
    api.delete<void>(`/posts/${postId}/comments/${commentId}`),
};
