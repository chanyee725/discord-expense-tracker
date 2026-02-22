import React from "react";
import { getCategoryBreakdown, getMonthlyTransactionStats } from "@/lib/queries";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import CategoryDetailList from "@/components/Dashboard/CategoryDetailList";
import MonthSelector from "@/components/Dashboard/MonthSelector";
import dayjs from "dayjs";

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <CategoryDonutChart
            series={categorySeries}
            labels={categoryLabels}
            centerLabel={`${selectedYear}년 ${selectedMonth}월`}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-gray-800">
            카테고리별 상세
          </h3>
          
          <CategoryDetailList 
            categoryBreakdown={categoryBreakdown}
            totalExpense={totalExpense}
            year={selectedYear}
            month={selectedMonth}
          />
        </div>
      </div>
    </div>
  );
}
