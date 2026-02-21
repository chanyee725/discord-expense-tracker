"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">
        Something went wrong!
      </h2>
      <p className="mb-8 text-center text-gray-500">
        We apologize for the inconvenience. <br />
        Please try refreshing the page or contact support if the problem persists.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-brand-500 hover:bg-brand-600 px-6 py-3 font-medium text-white rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
