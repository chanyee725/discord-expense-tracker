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
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <h2 className="mb-4 text-2xl font-bold text-text-primary">
        Something went wrong!
      </h2>
      <p className="mb-8 text-center text-text-secondary">
        We apologize for the inconvenience. <br />
        Please try refreshing the page or contact support if the problem persists.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-brand hover:bg-brand/85 px-6 py-3 font-medium text-white rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
