import { api } from "./client";
import type { ReactionSummary } from "../types";

export const reactionsApi = {
  get: (postId: number | string) => api.get<ReactionSummary>(`/posts/${postId}/reactions`),
  toggle: (postId: number | string, emoji: string) =>
    api.post<ReactionSummary>(`/posts/${postId}/reactions`, { emoji }),
};
