import { Metadata } from "next";
import {
  getTransactionsByMonth,
  getMonthlyTransactionStats,
  getCategories,
  getBankAccounts,
} from "@/lib/queries";
import { isSelfTransfer } from "@/lib/transfer-utils";
import CalendarView from "@/components/Calendar/CalendarView";
import dayjs from "dayjs";

export const metadata: Metadata = {
  title: "거래 내역 | 나만의 가계부",
  description: "월별 거래 내역을 달력 형식으로 확인",
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
  const currentDate = dayjs(`${yearParam}-${monthParam}-01`).format(
    "YYYY-MM-DD",
  );

  // Fetch transactions for the specified month
  const transactions = await getTransactionsByMonth(yearParam, monthParam);

  const monthlyStats = await getMonthlyTransactionStats(yearParam, monthParam);

  const categories = await getCategories("expense");
  const categoryNames = categories.map((c) => c.name);

  const bankAccounts = await getBankAccounts();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalIncome = transactions
    .filter((t) => {
      const isFuture = new Date(t.created_at) > today;
      return t.type === "수입" && !isFuture && !isSelfTransfer(t, bankAccounts);
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const serializedTransactions = transactions.map((t) => ({
    ...t,
    created_at: t.created_at.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[22px] font-bold leading-snug text-text-primary">
          거래 내역
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <CalendarView
          transactions={serializedTransactions}
          currentDate={currentDate}
          categories={categoryNames}
          totalIncome={totalIncome}
          totalExpense={monthlyStats.total_expense}
          bankAccounts={bankAccounts}
        />
      </div>
    </div>
  );
}
