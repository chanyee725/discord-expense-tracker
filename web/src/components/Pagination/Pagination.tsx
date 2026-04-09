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
          className="flex items-center justify-center rounded-xl bg-brand px-4 py-2 font-medium text-white hover:bg-brand/85 transition-colors"
        >
          이전
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center rounded-xl bg-brand px-4 py-2 font-medium text-white opacity-50 cursor-not-allowed"
        >
          이전
        </button>
      )}

      <span className="text-sm text-text-secondary">
        페이지 <span className="font-medium text-text-primary">{currentPage}</span> /{" "}
        <span className="font-medium text-text-primary">{totalPages}</span>
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`?page=${currentPage + 1}`}
          className="flex items-center justify-center rounded-xl bg-brand px-4 py-2 font-medium text-white hover:bg-brand/85 transition-colors"
        >
          다음
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center rounded-xl bg-brand px-4 py-2 font-medium text-white opacity-50 cursor-not-allowed"
        >
          다음
        </button>
      )}
    </div>
  );
};

export default Pagination;
