"use client";

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Try again
      </button>
    </div>
  );
}
