import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../api/client";

export default function AdminLogin() {
  const { admin, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && admin) {
    const redirectTo =
      (location.state as { from?: string } | null)?.from || "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-primary-900">관리자 로그인</h1>
        <p className="mt-2 text-sm text-gray-500">
          Amway 챔피언팀 관리자 계정으로 로그인해주세요.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="username" className="label-text">
              아이디
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="password" className="label-text">
              비밀번호
            </label>
            <input
              id="password"
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
      </div>
    </div>
  );
}
