import { useEffect, useState, type FormEvent } from "react";
import { productsApi } from "../../api/products";
import { ApiError } from "../../api/client";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

interface FormState {
  name: string;
  price: string;
  summary: string;
  description: string;
  imageUrl: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  price: "",
  summary: "",
  description: "",
  imageUrl: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function loadProducts() {
    setIsLoading(true);
    setListError(null);
    productsApi
      .list()
      .then(setProducts)
      .catch((err) =>
        setListError(
          err instanceof ApiError ? err.message : "제품 목록을 불러오지 못했습니다."
        )
      )
      .finally(() => setIsLoading(false));
  }

  useEffect(loadProducts, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      summary: product.summary ?? "",
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function validate(): string | null {
    if (!form.name.trim()) return "제품명을 입력해주세요.";
    const priceNum = Number(form.price);
    if (
      form.price.trim() === "" ||
      !Number.isInteger(priceNum) ||
      priceNum < 0
    ) {
      return "가격은 0 이상의 정수로 입력해주세요.";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      summary: form.summary.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (editingId) {
        const updated = await productsApi.update(editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
      } else {
        const created = await productsApi.create(payload);
        setProducts((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "제품 저장에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`'${product.name}' 제품을 삭제하시겠습니까?`);
    if (!confirmed) return;
    setDeletingId(product.id);
    try {
      await productsApi.remove(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setListError(
        err instanceof ApiError ? err.message : "제품 삭제에 실패했습니다."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-600">Admin</p>
          <h1 className="section-title mt-1">제품 관리</h1>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateForm}>
          + 제품 추가
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="card mb-10 space-y-5 p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-gray-900">
            {editingId ? "제품 수정" : "새 제품 등록"}
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label-text">
                제품명
              </label>
              <input
                id="name"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="price" className="label-text">
                가격 (원)
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step={1}
                className="input-field"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                aria-required="true"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="summary" className="label-text">
                요약 설명
              </label>
              <input
                id="summary"
                className="input-field"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="imageUrl" className="label-text">
                이미지 URL
              </label>
              <input
                id="imageUrl"
                className="input-field"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="label-text">
                상세 설명
              </label>
              <textarea
                id="description"
                className="input-field min-h-[120px] resize-y"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-accent-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={closeForm}>
              취소
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : editingId ? "수정 저장" : "등록하기"}
            </button>
          </div>
        </form>
      )}

      {isLoading && <Loading label="제품 목록을 불러오는 중입니다..." />}
      {listError && <ErrorMessage message={listError} />}

      {!isLoading && !listError && (
        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-card">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-primary-50 text-left text-primary-900">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  제품명
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  가격
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  요약
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatPrice(product.price)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                    {product.summary}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-secondary px-3 py-1.5 text-xs"
                        onClick={() => openEditForm(product)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-3 py-1.5 text-xs"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    등록된 제품이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
