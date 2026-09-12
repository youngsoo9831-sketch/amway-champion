import { useState, type FormEvent } from "react";
import { useMemberAuth } from "../../context/MemberAuthContext";
import { ApiError } from "../../api/client";

const PASSWORD_MIN_LENGTH = 6;

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function MemberSignupForm({ onSuccess, compact = false }: Props) {
  const { register } = useMemberAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (!email.trim()) return "이메일을 입력해주세요.";
    if (!name.trim()) return "이름을 입력해주세요.";
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
    }
    if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
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
      await register(email.trim(), name.trim(), password);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "회원가입에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldSpacing = compact ? "space-y-3" : "space-y-5";

  return (
    <form onSubmit={handleSubmit} noValidate className={fieldSpacing}>
      <div>
        <label htmlFor="member-signup-email" className="label-text">
          이메일
        </label>
        <input
          id="member-signup-email"
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
        <label htmlFor="member-signup-name" className="label-text">
          이름
        </label>
        <input
          id="member-signup-name"
          name="name"
          type="text"
          autoComplete="name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="member-signup-password" className="label-text">
          비밀번호
        </label>
        <input
          id="member-signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="input-field"
          value={password}
          minLength={PASSWORD_MIN_LENGTH}
          onChange={(e) => setPassword(e.target.value)}
          aria-required="true"
        />
      </div>
      <div>
        <label htmlFor="member-signup-password-confirm" className="label-text">
          비밀번호 확인
        </label>
        <input
          id="member-signup-password-confirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className="input-field"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
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
        aria-label="회원가입"
      >
        {isSubmitting ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
