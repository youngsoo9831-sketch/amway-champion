import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { productsApi } from "../../api/products";
import { postsApi } from "../../api/posts";

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);

  useEffect(() => {
    productsApi
      .list()
      .then((data) => setProductCount(data.length))
      .catch(() => setProductCount(null));

    Promise.all([postsApi.list("FREE"), postsApi.list("MEMBER")])
      .then(([freePosts, memberPosts]) =>
        setPostCount(freePosts.length + memberPosts.length)
      )
      .catch(() => setPostCount(null));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-600">Admin</p>
          <h1 className="section-title mt-1">
            안녕하세요, {admin?.username}님
          </h1>
        </div>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-gray-500">등록된 제품 수</p>
          <p className="mt-2 text-3xl font-bold text-primary-900">
            {productCount ?? "-"}
          </p>
          <Link to="/admin/products" className="btn-primary mt-5 inline-flex">
            제품 관리하기
          </Link>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">등록된 게시글 수</p>
          <p className="mt-2 text-3xl font-bold text-primary-900">
            {postCount ?? "-"}
          </p>
          <Link to="/board" className="btn-secondary mt-5 inline-flex">
            게시판 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
