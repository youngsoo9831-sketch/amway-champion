import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postsApi } from "../api/posts";
import { ApiError } from "../api/client";
import type { BoardType, Post } from "../types";
import { formatDate } from "../utils/format";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useMemberAuth } from "../context/MemberAuthContext";

const BOARD_LABEL: Record<BoardType, string> = {
  FREE: "자유 게시판",
  MEMBER: "회원 전용 게시판",
};

export default function BoardList({ boardType }: { boardType: BoardType }) {
  const { admin } = useAuth();
  const { member, isLoading: memberLoading } = useMemberAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = boardType === "FREE" || !!member || !!admin;

  useEffect(() => {
    if (memberLoading) return;
    if (!canView) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    setError(null);
    postsApi
      .list(boardType)
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "게시글을 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [boardType, canView, memberLoading]);

  const newPostPath = boardType === "FREE" ? "/board/free/new" : "/board/members/new";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex gap-2 border-b border-gray-100">
        <Link
          to="/board/free"
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            boardType === "FREE"
              ? "border-primary-900 text-primary-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          자유 게시판
        </Link>
        <Link
          to="/board/members"
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            boardType === "MEMBER"
              ? "border-primary-900 text-primary-900"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          회원 전용 게시판
        </Link>
      </div>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">{BOARD_LABEL[boardType]}</h1>
          <p className="mt-2 text-gray-500">
            {boardType === "FREE"
              ? "문의사항이나 후기를 자유롭게 남겨주세요. 비회원도 작성할 수 있어요."
              : "로그인한 회원만 보고 작성할 수 있는 게시판입니다."}
          </p>
        </div>
        {canView && (
          <Link to={newPostPath} className="btn-primary">
            글쓰기
          </Link>
        )}
      </header>

      {!canView && (
        <div className="card p-8 text-center">
          <p className="text-gray-600">
            회원 전용 게시판은 로그인 후 이용할 수 있습니다.
          </p>
          <Link
            to="/login"
            state={{ from: "/board/members" }}
            className="btn-primary mt-4 inline-flex"
          >
            로그인하러 가기
          </Link>
        </div>
      )}

      {canView && isLoading && <Loading label="게시글을 불러오는 중입니다..." />}
      {canView && error && <ErrorMessage message={error} />}
      {canView && !isLoading && !error && posts.length === 0 && (
        <p className="py-16 text-center text-gray-500">
          아직 등록된 게시글이 없습니다. 첫 번째 글을 남겨보세요!
        </p>
      )}
      {canView && !isLoading && !error && posts.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 shadow-card">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                to={`/board/${post.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-primary-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{post.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {post.author} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-sm text-gray-400">
                  <span>💬 {post.commentCount ?? 0}</span>
                  <span>👍 {post.reactionCount ?? 0}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
