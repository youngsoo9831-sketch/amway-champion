import { useEffect, useState, type FormEvent } from "react";
import { commentsApi } from "../../api/comments";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useMemberAuth } from "../../context/MemberAuthContext";
import type { BoardType, Comment } from "../../types";
import { formatDate } from "../../utils/format";
import Loading from "../Loading";

const CONTENT_MAX = 1000;

export default function CommentSection({
  postId,
  boardType,
}: {
  postId: number;
  boardType: BoardType;
}) {
  const { admin } = useAuth();
  const { member } = useMemberAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setListError(null);
    commentsApi
      .list(postId)
      .then(setComments)
      .catch((err) =>
        setListError(
          err instanceof ApiError ? err.message : "댓글을 불러오지 못했습니다."
        )
      )
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [postId]);

  const canWrite = boardType === "FREE" || !!member;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setFormError("댓글 내용을 입력해주세요.");
      return;
    }
    if (boardType === "FREE" && !member && !author.trim()) {
      setFormError("작성자를 입력해주세요.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const comment = await commentsApi.create(postId, {
        content: content.trim(),
        ...(boardType === "FREE" && !member ? { author: author.trim() } : {}),
      });
      setComments((prev) => [...prev, comment]);
      setContent("");
      setAuthor("");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "댓글 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    const confirmed = window.confirm("이 댓글을 삭제하시겠습니까?");
    if (!confirmed) return;
    setDeletingId(commentId);
    try {
      await commentsApi.remove(postId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setListError(
        err instanceof ApiError ? err.message : "댓글 삭제에 실패했습니다."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="text-lg font-bold text-gray-900">댓글 {comments.length}</h2>

      {isLoading && <Loading label="댓글을 불러오는 중입니다..." />}
      {listError && <p className="mt-3 text-sm text-accent-600">{listError}</p>}

      {!isLoading && (
        <ul className="mt-4 space-y-4">
          {comments.map((comment) => {
            const canDelete =
              !!admin || (!!member && comment.authorMemberId === member.id);
            return (
              <li key={comment.id} className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {comment.author}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </p>
                  {canDelete && (
                    <button
                      type="button"
                      className="text-xs font-medium text-accent-600 hover:underline"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                    >
                      {deletingId === comment.id ? "삭제 중..." : "삭제"}
                    </button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                  {comment.content}
                </p>
              </li>
            );
          })}
          {comments.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </p>
          )}
        </ul>
      )}

      {canWrite ? (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-3">
          {boardType === "FREE" && !member && (
            <input
              type="text"
              className="input-field"
              placeholder="작성자 이름"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              aria-label="작성자 이름"
            />
          )}
          <textarea
            className="input-field min-h-[90px] resize-y"
            placeholder="댓글을 입력해주세요."
            value={content}
            maxLength={CONTENT_MAX}
            onChange={(e) => setContent(e.target.value)}
            aria-label="댓글 내용"
          />
          {formError && <p className="text-sm text-accent-600">{formError}</p>}
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-sm text-gray-500">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}
    </div>
  );
}
