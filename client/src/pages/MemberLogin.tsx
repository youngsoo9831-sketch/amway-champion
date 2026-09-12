import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMemberAuth } from "../context/MemberAuthContext";
import MemberLoginForm from "../components/auth/MemberLoginForm";

export default function MemberLogin() {
  const { member, isLoading } = useMemberAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  if (!isLoading && member) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-primary-900">로그인</h1>
        <p className="mt-2 text-sm text-gray-500">
          Amway 챔피언팀 회원 계정으로 로그인해주세요.
        </p>

        <div className="mt-6">
          <MemberLoginForm onSuccess={() => navigate(from, { replace: true })} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          아직 회원이 아니신가요?{" "}
          <Link
            to="/signup"
            state={{ from }}
            className="font-semibold text-primary-700 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
