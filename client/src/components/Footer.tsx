import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-100 bg-primary-950 text-primary-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold text-white">Amway 챔피언팀</p>
            <p className="mt-2 max-w-sm text-sm text-primary-200">
              건강하고 지속가능한 삶을 위한 최고의 파트너, Amway 챔피언팀
              공식 웹사이트입니다.
            </p>
          </div>
          <nav aria-label="푸터 내비게이션" className="flex flex-col gap-2 text-sm">
            <Link to="/about" className="hover:text-white">
              회사 소개
            </Link>
            <Link to="/products" className="hover:text-white">
              제품 안내
            </Link>
            <Link to="/board" className="hover:text-white">
              고객 게시판
            </Link>
            <Link to="/admin/login" className="hover:text-white">
              관리자 로그인
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-primary-800 pt-6 text-xs text-primary-300">
          © {year} Amway 챔피언팀. All rights reserved. 본 사이트는 Amway
          독립 사업자 챔피언팀이 운영하는 공식 소개 웹사이트입니다.
        </p>
      </div>
    </footer>
  );
}
