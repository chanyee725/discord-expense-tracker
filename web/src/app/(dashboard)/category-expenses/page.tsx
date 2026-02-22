import React from "react";
import { getCategoryBreakdown, getMonthlyTransactionStats } from "@/lib/queries";
import MonthSelector from "@/components/Dashboard/MonthSelector";
import dayjs from "dayjs";
import CategoryExpensesClient from "./CategoryExpensesClient";

export const dynamic = "force-dynamic";

export default async function CategoryExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ selectedYear?: string; selectedMonth?: string }>;
}) {
  const params = await searchParams;
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const selectedYear = params.selectedYear
    ? Number(params.selectedYear)
    : currentYear;
  const selectedMonth = params.selectedMonth
    ? Number(params.selectedMonth)
    : currentMonth;

  const [categoryBreakdown, monthlyStats] = await Promise.all([
    getCategoryBreakdown(selectedYear, selectedMonth),
    getMonthlyTransactionStats(selectedYear, selectedMonth),
  ]);

  const totalExpense = monthlyStats.total_expense;

  const categorySeries = categoryBreakdown.map((c) => c.total);
  const categoryLabels = categoryBreakdown.map((c) => c.category || "미분류");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          카테고리별 지출 내역
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 mb-6">
        <div className="md:col-span-12">
          <MonthSelector />
        </div>
      </div>

      <CategoryExpensesClient
        categorySeries={categorySeries}
        categoryLabels={categoryLabels}
        centerLabel={`${selectedYear}년 ${selectedMonth}월`}
        categoryBreakdown={categoryBreakdown}
        totalExpense={totalExpense}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
