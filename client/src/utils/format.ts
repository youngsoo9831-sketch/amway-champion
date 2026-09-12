export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
