import { Metadata } from "next";
import { getTransactionsByMonth, getMonthlyTransactionStats } from "@/lib/queries";
import CalendarView from "@/components/Calendar/CalendarView";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "Transactions | Poor Guy Dashboard",
  description: "View all transaction history in calendar format",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = dayjs();
  
  // Parse year and month from URL params, defaulting to current
  const yearParam = params?.year ? Number(params.year) : now.year();
  const monthParam = params?.month ? Number(params.month) : now.month() + 1; // 1-12
  
  // Construct a valid date string for the calendar
  // Use dayjs to ensure valid date formatting (e.g., 2023-01-01)
  const currentDate = dayjs(`${yearParam}-${monthParam}-01`).format("YYYY-MM-DD");

  // Fetch transactions for the specified month
  const transactions = await getTransactionsByMonth(yearParam, monthParam);
  
  const monthlyStats = await getMonthlyTransactionStats(yearParam, monthParam);

  const serializedTransactions = transactions.map((t) => ({
    ...t,
    created_at: t.created_at.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-gray-800">
          거래 내역
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <CalendarView 
          transactions={serializedTransactions} 
          currentDate={currentDate} 
          totalIncome={0}
          totalExpense={monthlyStats.total_expense}
        />
      </div>
    </div>
  );
}
