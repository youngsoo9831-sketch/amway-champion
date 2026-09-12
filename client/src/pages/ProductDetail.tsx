import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    productsApi
      .get(id)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "제품 정보를 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) return <Loading label="제품 정보를 불러오는 중입니다..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <ErrorMessage message={error} />
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          이전으로 돌아가기
        </button>
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/products" className="hover:text-primary-700">
          전체 제품
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-card">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              이미지 준비 중
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {product.name}
          </h1>
          {product.summary && (
            <p className="mt-2 text-base text-gray-500">{product.summary}</p>
          )}
          <p className="mt-6 text-3xl font-bold text-primary-900">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                제품 상세 설명
              </h2>
              <p className="mt-3 whitespace-pre-line text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/board/free/new" className="btn-primary">
              제품 문의하기
            </Link>
            <Link to="/products" className="btn-secondary">
              목록으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
