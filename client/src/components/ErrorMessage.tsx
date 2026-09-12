export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mx-auto my-8 max-w-lg rounded-md border border-accent-200 bg-accent-50 px-4 py-3 text-center text-sm text-accent-700"
    >
      {message}
    </div>
  );
}
