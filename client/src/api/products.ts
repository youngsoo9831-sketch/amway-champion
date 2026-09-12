import { api } from "./client";
import type { Product, ProductInput } from "../types";

export const productsApi = {
  list: () => api.get<Product[]>("/products"),
  get: (id: number | string) => api.get<Product>(`/products/${id}`),
  create: (data: ProductInput) => api.post<Product>("/products", data),
  update: (id: number | string, data: ProductInput) =>
    api.put<Product>(`/products/${id}`, data),
  remove: (id: number | string) => api.delete<void>(`/products/${id}`),
};
