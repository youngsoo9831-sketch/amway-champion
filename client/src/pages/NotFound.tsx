import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-accent-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-2 text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link to="/" className="btn-primary mt-6">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
