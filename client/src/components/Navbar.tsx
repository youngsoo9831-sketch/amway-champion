import { useState } from "react";
import { NavLink } from "react-router-dom";
import NavbarMemberStatus from "./NavbarMemberStatus";

const NAV_LINKS = [
  { to: "/", label: "홈", end: true },
  { to: "/about", label: "회사 소개" },
  { to: "/products", label: "제품" },
  { to: "/board", label: "고객 게시판" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-900 text-white"
        : "text-gray-700 hover:bg-primary-50 hover:text-primary-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label="주요 내비게이션"
      >
        <NavLink
          to="/"
          className="flex items-center gap-2 text-lg font-extrabold text-primary-900"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-900 text-sm font-bold text-white"
            aria-hidden="true"
          >
            A
          </span>
          Amway 챔피언팀
        </NavLink>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="border-l border-gray-200 pl-4">
            <NavbarMemberStatus />
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-primary-50 md:hidden"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3">
            <NavbarMemberStatus onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
