import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import MemberAuthCard from "../components/auth/MemberAuthCard";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    productsApi
      .list()
      .then((data) => {
        if (active) setProducts(data.slice(0, 3));
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "제품을 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-primary-100">
              Amway 챔피언팀 공식 웹사이트
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              건강하고 지속가능한 삶,
              <br />
              Amway 챔피언팀과 함께하세요
            </h1>
            <p className="max-w-xl text-base text-primary-100 sm:text-lg">
              뉴트리라이트 영양 제품부터 아이쿡 주방용품, 홈케어 세제까지 —
              검증된 Amway 제품을 소개하고, 고객 여러분과 함께 소통하는
              공간입니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary bg-white text-primary-900 hover:bg-primary-50">
                제품 둘러보기
              </Link>
              <Link
                to="/about"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                챔피언팀 소개
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MemberAuthCard />
          </div>
        </div>
      </section>

      {/* 대표 제품 3종 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title">대표 제품</h2>
            <p className="mt-2 text-gray-500">
              챔피언팀이 자신 있게 추천하는 인기 제품을 만나보세요.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden text-sm font-semibold text-primary-700 hover:underline sm:inline"
          >
            전체 제품 보기 →
          </Link>
        </div>

        {isLoading && <Loading label="대표 제품을 불러오는 중입니다..." />}
        {error && <ErrorMessage message={error} />}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/products" className="btn-secondary">
            전체 제품 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
