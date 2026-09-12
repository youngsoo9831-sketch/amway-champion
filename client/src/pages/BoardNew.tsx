import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { postsApi } from "../api/posts";
import { ApiError } from "../api/client";
import type { BoardType } from "../types";
import { useMemberAuth } from "../context/MemberAuthContext";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;
const GUEST_PASSWORD_MIN = 4;

const BOARD_LABEL: Record<BoardType, string> = {
  FREE: "자유 게시판",
  MEMBER: "회원 전용 게시판",
};

export default function BoardNew({ boardType }: { boardType: BoardType }) {
  const { member, isLoading: memberLoading } = useMemberAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (boardType === "MEMBER" && !memberLoading && !member) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isGuest = !member;

  function validate(): string | null {
    if (!title.trim()) return "제목을 입력해주세요.";
    if (title.trim().length > TITLE_MAX) return `제목은 ${TITLE_MAX}자를 초과할 수 없습니다.`;
    if (!content.trim()) return "내용을 입력해주세요.";
    if (content.trim().length > CONTENT_MAX)
      return `내용은 ${CONTENT_MAX}자를 초과할 수 없습니다.`;
    if (boardType === "FREE" && isGuest) {
      if (!author.trim()) return "작성자를 입력해주세요.";
      if (!guestPassword || guestPassword.length < GUEST_PASSWORD_MIN) {
        return `비밀번호는 ${GUEST_PASSWORD_MIN}자 이상 입력해주세요. (글 수정·삭제 시 필요합니다)`;
      }
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const post = await postsApi.create({
        boardType,
        title: title.trim(),
        content: content.trim(),
        ...(boardType === "FREE" && isGuest
          ? { author: author.trim(), guestPassword }
          : {}),
      });
      navigate(`/board/${post.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "게시글 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const listPath = boardType === "FREE" ? "/board/free" : "/board/members";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold text-accent-600">{BOARD_LABEL[boardType]}</p>
        <h1 className="section-title mt-1">글쓰기</h1>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="title" className="label-text">
            제목
          </label>
          <input
            id="title"
            type="text"
            className="input-field"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
          />
        </div>

        {boardType === "FREE" && isGuest ? (
          <>
            <div>
              <label htmlFor="author" className="label-text">
                작성자
              </label>
              <input
                id="author"
                type="text"
                className="input-field"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="guestPassword" className="label-text">
                비밀번호
              </label>
              <input
                id="guestPassword"
                type="password"
                className="input-field"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                aria-required="true"
              />
              <p className="mt-1 text-xs text-gray-400">
                글을 수정·삭제할 때 필요하니 잊지 말고 기억해주세요.
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            작성자: <span className="font-semibold text-gray-800">{member?.name}</span>
          </p>
        )}

        <div>
          <label htmlFor="content" className="label-text">
            내용
          </label>
          <textarea
            id="content"
            className="input-field min-h-[200px] resize-y"
            value={content}
            maxLength={CONTENT_MAX}
            onChange={(e) => setContent(e.target.value)}
            aria-required="true"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {content.length} / {CONTENT_MAX}
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-accent-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Link to={listPath} className="btn-secondary">
            취소
          </Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
