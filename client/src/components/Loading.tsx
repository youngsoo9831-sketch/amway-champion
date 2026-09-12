export default function Loading({ label = "불러오는 중입니다..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-700"
        aria-hidden="true"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
