import { useState } from "react";
import { Link } from "react-router-dom";
import { useMemberAuth } from "../context/MemberAuthContext";

export default function NavbarMemberStatus({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { member, isLoading, logout } = useMemberAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoading) return null;

  if (member) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">
          <span className="font-semibold text-primary-900">{member.name}</span>
          님
        </span>
        <button
          type="button"
          className="rounded-md px-2 py-1 font-medium text-gray-500 hover:bg-primary-50 hover:text-primary-900"
          disabled={isLoggingOut}
          onClick={async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              onNavigate?.();
            } finally {
              setIsLoggingOut(false);
            }
          }}
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Link
        to="/login"
        onClick={onNavigate}
        className="rounded-md px-3 py-1.5 text-gray-700 hover:bg-primary-50 hover:text-primary-900"
      >
        로그인
      </Link>
      <Link
        to="/signup"
        onClick={onNavigate}
        className="rounded-md bg-primary-900 px-3 py-1.5 text-white hover:bg-primary-700"
      >
        회원가입
      </Link>
    </div>
  );
}
