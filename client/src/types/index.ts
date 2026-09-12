export interface Product {
  id: number;
  name: string;
  price: number;
  summary: string | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export type ProductInput = {
  name: string;
  price: number;
  summary?: string;
  description?: string;
  imageUrl?: string;
};

export type BoardType = "FREE" | "MEMBER";

export interface Post {
  id: number;
  boardType: BoardType;
  title: string;
  author: string;
  content: string;
  authorMemberId: number | null;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  reactionCount?: number;
}

export type PostCreateInput = {
  boardType: BoardType;
  title: string;
  content: string;
  author?: string; // 비회원 작성 시에만 필요
  guestPassword?: string; // 비회원 작성 시에만 필요
};

export type PostUpdateInput = {
  title: string;
  content: string;
  guestPassword?: string; // 비회원 글 수정 시에만 필요
};

export interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  authorMemberId: number | null;
  createdAt: string;
}

export interface ReactionSummary {
  counts: Record<string, number>;
  mine: string[];
}

export interface AdminUser {
  username: string;
}

export interface Member {
  id: number;
  email: string;
  name: string;
}

export interface ApiErrorBody {
  error: string;
}
