import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { postsApi } from "../api/posts";
import { ApiError } from "../api/client";
import type { BoardType, Post } from "../types";
import { formatDate } from "../utils/format";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import ReactionBar from "../components/board/ReactionBar";
import CommentSection from "../components/board/CommentSection";
import { useAuth } from "../context/AuthContext";
import { useMemberAuth } from "../context/MemberAuthContext";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

const BOARD_LABEL: Record<BoardType, string> = {
  FREE: "자유 게시판",
  MEMBER: "회원 전용 게시판",
};

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { member } = useMemberAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function loadPost() {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    setNeedsLogin(false);
    postsApi
      .get(id)
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          setNeedsLogin(true);
        } else {
          setLoadError(
            err instanceof ApiError ? err.message : "게시글을 불러오지 못했습니다."
          );
        }
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadPost, [id]);

  if (isLoading) return <Loading label="게시글을 불러오는 중입니다..." />;

  if (needsLogin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="card p-8">
          <p className="text-gray-600">
            회원 전용 게시판 글은 로그인 후 볼 수 있습니다.
          </p>
          <Link
            to="/login"
            state={{ from: `/board/${id}` }}
            className="btn-primary mt-4 inline-flex"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <ErrorMessage message={loadError} />
        <Link to="/board/free" className="btn-secondary">
          목록으로
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const isOwnerMember = !!member && post.authorMemberId === member.id;
  const isAdmin = !!admin;
  const canManage = isAdmin || isOwnerMember || post.isGuest;
  const requiresPasswordForManage = post.isGuest && !isAdmin;
  const listPath = post.boardType === "FREE" ? "/board/free" : "/board/members";

  function validate(): string | null {
    if (!title.trim()) return "제목을 입력해주세요.";
    if (title.trim().length > TITLE_MAX) return `제목은 ${TITLE_MAX}자를 초과할 수 없습니다.`;
    if (!content.trim()) return "내용을 입력해주세요.";
    if (content.trim().length > CONTENT_MAX)
      return `내용은 ${CONTENT_MAX}자를 초과할 수 없습니다.`;
    if (requiresPasswordForManage && !editPassword) return "비밀번호를 입력해주세요.";
    return null;
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    if (!id) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const updated = await postsApi.update(id, {
        title: title.trim(),
        content: content.trim(),
        ...(requiresPasswordForManage ? { guestPassword: editPassword } : {}),
      });
      setPost(updated);
      setIsEditing(false);
      setEditPassword("");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "게시글 수정에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setActionError(null);

    let guestPassword: string | undefined;
    if (requiresPasswordForManage) {
      const input = window.prompt("작성 시 입력한 비밀번호를 입력해주세요.");
      if (input === null) return;
      if (!input) {
        setActionError("비밀번호를 입력해주세요.");
        return;
      }
      guestPassword = input;
    } else {
      const confirmed = window.confirm("정말로 이 게시글을 삭제하시겠습니까?");
      if (!confirmed) return;
    }

    setIsDeleting(true);
    try {
      await postsApi.remove(id, guestPassword);
      navigate(listPath);
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "게시글 삭제에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to={listPath} className="hover:text-primary-700">
          {BOARD_LABEL[post.boardType]}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{post.title}</span>
      </nav>

      {!isEditing ? (
        <article className="card p-6 sm:p-8">
          <span className="inline-block rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            {BOARD_LABEL[post.boardType]}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{post.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {post.author} · {formatDate(post.createdAt)}
            {post.updatedAt !== post.createdAt && " (수정됨)"}
          </p>
          <div className="mt-6 whitespace-pre-line border-t border-gray-100 pt-6 text-gray-700">
            {post.content}
          </div>

          <div className="mt-6">
            <ReactionBar postId={post.id} />
          </div>

          {actionError && (
            <p role="alert" className="mt-4 text-sm text-accent-600">
              {actionError}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Link to={listPath} className="btn-secondary">
              목록으로
            </Link>
            {canManage && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                수정
              </button>
            )}
            {canManage && (
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="게시글 삭제"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            )}
          </div>
        </article>
      ) : (
        <form onSubmit={handleUpdate} noValidate className="card space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="edit-title" className="label-text">
              제목
            </label>
            <input
              id="edit-title"
              type="text"
              className="input-field"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-content" className="label-text">
              내용
            </label>
            <textarea
              id="edit-content"
              className="input-field min-h-[200px] resize-y"
              value={content}
              maxLength={CONTENT_MAX}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {requiresPasswordForManage && (
            <div>
              <label htmlFor="edit-password" className="label-text">
                비밀번호
              </label>
              <input
                id="edit-password"
                type="password"
                className="input-field"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>
          )}

          {formError && (
            <p role="alert" className="text-sm text-accent-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsEditing(false);
                setFormError(null);
                setTitle(post.title);
                setContent(post.content);
                setEditPassword("");
              }}
            >
              취소
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      )}

      {!isEditing && <CommentSection postId={post.id} boardType={post.boardType} />}
    </div>
  );
}
