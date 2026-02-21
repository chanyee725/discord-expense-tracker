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
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-boxdark">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Something went wrong!
      </h2>
      <p className="mb-8 text-center text-body dark:text-bodydark">
        We apologize for the inconvenience. <br />
        Please try refreshing the page or contact support if the problem persists.
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
