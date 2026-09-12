import { useEffect, useState } from "react";
import { productsApi } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    productsApi
      .list()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "제품 목록을 불러오지 못했습니다."
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
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="section-title">전체 제품</h1>
        <p className="mt-2 text-gray-500">
          Amway 챔피언팀이 소개하는 제품 라인업입니다.
        </p>
      </header>

      {isLoading && <Loading label="제품 목록을 불러오는 중입니다..." />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && products.length === 0 && (
        <p className="py-16 text-center text-gray-500">
          등록된 제품이 없습니다.
        </p>
      )}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
