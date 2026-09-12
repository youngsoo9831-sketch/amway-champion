import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMemberAuth } from "../context/MemberAuthContext";
import MemberSignupForm from "../components/auth/MemberSignupForm";

export default function MemberSignup() {
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
        <h1 className="text-2xl font-bold text-primary-900">회원가입</h1>
        <p className="mt-2 text-sm text-gray-500">
          Amway 챔피언팀 웹사이트에 오신 것을 환영합니다.
        </p>

        <div className="mt-6">
          <MemberSignupForm onSuccess={() => navigate(from, { replace: true })} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 회원이신가요?{" "}
          <Link
            to="/login"
            state={{ from }}
            className="font-semibold text-primary-700 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
