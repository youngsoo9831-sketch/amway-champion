import { useState } from "react";
import { Link } from "react-router-dom";
import { useMemberAuth } from "../../context/MemberAuthContext";
import MemberLoginForm from "./MemberLoginForm";
import MemberSignupForm from "./MemberSignupForm";

type Mode = "login" | "signup";

export default function MemberAuthCard() {
  const { member, isLoading, logout } = useMemberAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-card-hover sm:p-8">
        불러오는 중...
      </div>
    );
  }

  if (member) {
    return (
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card-hover sm:p-8">
        <p className="text-sm text-gray-500">환영합니다</p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {member.name}님
        </p>
        <p className="mt-1 truncate text-sm text-gray-500">{member.email}</p>
        <button
          type="button"
          className="btn-secondary mt-6 w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="로그아웃"
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card-hover sm:p-8">
      <div
        role="tablist"
        aria-label="로그인 또는 회원가입 선택"
        className="mb-5 flex rounded-md bg-gray-100 p-1 text-sm font-semibold"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={`flex-1 rounded-md py-2 transition-colors ${
            mode === "login"
              ? "bg-white text-primary-900 shadow-sm"
              : "text-gray-500"
          }`}
          onClick={() => setMode("login")}
        >
          로그인
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={`flex-1 rounded-md py-2 transition-colors ${
            mode === "signup"
              ? "bg-white text-primary-900 shadow-sm"
              : "text-gray-500"
          }`}
          onClick={() => setMode("signup")}
        >
          회원가입
        </button>
      </div>

      {mode === "login" ? (
        <>
          <MemberLoginForm compact />
          <p className="mt-4 text-center text-sm text-gray-500">
            아직 회원이 아니신가요?{" "}
            <button
              type="button"
              className="font-semibold text-primary-700 hover:underline"
              onClick={() => setMode("signup")}
            >
              회원가입
            </button>
          </p>
        </>
      ) : (
        <>
          <MemberSignupForm compact onSuccess={() => setMode("login")} />
          <p className="mt-4 text-center text-sm text-gray-500">
            이미 회원이신가요?{" "}
            <button
              type="button"
              className="font-semibold text-primary-700 hover:underline"
              onClick={() => setMode("login")}
            >
              로그인
            </button>
          </p>
        </>
      )}

      <p className="mt-4 text-center text-xs text-gray-400">
        전체 화면으로 보기:{" "}
        <Link to="/login" className="underline hover:text-gray-600">
          로그인
        </Link>{" "}
        ·{" "}
        <Link to="/signup" className="underline hover:text-gray-600">
          회원가입
        </Link>
      </p>
    </div>
  );
}
