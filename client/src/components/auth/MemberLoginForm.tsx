import { useState, type FormEvent } from "react";
import { useMemberAuth } from "../../context/MemberAuthContext";
import { ApiError } from "../../api/client";

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function MemberLoginForm({ onSuccess, compact = false }: Props) {
  const { login } = useMemberAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldSpacing = compact ? "space-y-3" : "space-y-5";

  return (
    <form onSubmit={handleSubmit} noValidate className={fieldSpacing}>
      <div>
        <label htmlFor="member-login-email" className="label-text">
          이메일
        </label>
        <input
          id="member-login-email"
          name="email"
          type="email"
          autoComplete="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="member-login-password" className="label-text">
          비밀번호
        </label>
        <input
          id="member-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-required="true"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-accent-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting}
        aria-label="로그인"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
