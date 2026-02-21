import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {currentPage > 1 ? (
        <Link
          href={`?page=${currentPage - 1}`}
          className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 dark:bg-primary dark:hover:bg-opacity-90"
        >
          이전
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white opacity-50 cursor-not-allowed dark:bg-primary"
        >
          이전
        </button>
      )}

      <span className="text-sm text-black dark:text-white">
        페이지 <span className="font-medium">{currentPage}</span> /{" "}
        <span className="font-medium">{totalPages}</span>
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`?page=${currentPage + 1}`}
          className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 dark:bg-primary dark:hover:bg-opacity-90"
        >
          다음
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center rounded bg-primary px-4 py-2 font-medium text-white opacity-50 cursor-not-allowed dark:bg-primary"
        >
          다음
        </button>
      )}
    </div>
  );
};

export default Pagination;
