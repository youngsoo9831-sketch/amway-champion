import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reactionsApi } from "../../api/reactions";
import { ApiError } from "../../api/client";
import { EMOJI_OPTIONS } from "../../constants/emoji";
import { useMemberAuth } from "../../context/MemberAuthContext";
import type { ReactionSummary } from "../../types";

export default function ReactionBar({ postId }: { postId: number }) {
  const { member } = useMemberAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ReactionSummary | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    reactionsApi
      .get(postId)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        if (active) setSummary({ counts: {}, mine: [] });
      });
    return () => {
      active = false;
    };
  }, [postId]);

  async function handleClick(key: string) {
    if (!member) {
      navigate("/login", { state: { from: `/board/${postId}` } });
      return;
    }
    setPendingKey(key);
    try {
      const data = await reactionsApi.toggle(postId, key);
      setSummary(data);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="이모지 반응">
      {EMOJI_OPTIONS.map((opt) => {
        const count = summary?.counts?.[opt.key] ?? 0;
        const active = summary?.mine?.includes(opt.key) ?? false;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleClick(opt.key)}
            disabled={pendingKey === opt.key}
            title={member ? opt.label : "로그인 후 반응을 남길 수 있어요"}
            aria-label={`${opt.label} 반응 (${count}개)`}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-primary-500 bg-primary-50 text-primary-900"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50"
            }`}
          >
            <span aria-hidden="true">{opt.emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
