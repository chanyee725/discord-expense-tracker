import { Metadata } from "next";
import { getTransactionCount, getTransactions } from "@/lib/queries";
import TransactionTable from "@/components/Tables/TransactionTable";
import Pagination from "@/components/Pagination/Pagination";

export const metadata: Metadata = {
  title: "Transactions | Poor Guy Dashboard",
  description: "View all transaction history",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const limit = 20;

  const [transactions, totalCount] = await Promise.all([
    getTransactions(currentPage, limit),
    getTransactionCount(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          거래 내역
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <TransactionTable transactions={transactions} />
        
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
