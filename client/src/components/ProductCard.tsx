import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="card group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={`${product.name} 상세 보기`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            이미지 준비 중
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
          {product.name}
        </h3>
        {product.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
            {product.summary}
          </p>
        )}
        <p className="mt-3 text-lg font-bold text-primary-900">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
