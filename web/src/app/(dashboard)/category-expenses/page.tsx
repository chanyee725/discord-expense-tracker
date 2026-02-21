import React from "react";
import { getCategoryBreakdown, getMonthlyTransactionStats } from "@/lib/queries";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default async function CategoryExpensesPage() {
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const [categoryBreakdown, monthlyStats] = await Promise.all([
    getCategoryBreakdown(currentYear, currentMonth),
    getMonthlyTransactionStats(currentYear, currentMonth),
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

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center sm:flex-row sm:gap-4">
          <span className="text-lg text-gray-500">이번 달 총 지출</span>
          <span className="text-3xl font-bold text-gray-800">
            {totalExpense.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <CategoryDonutChart
            series={categorySeries}
            labels={categoryLabels}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-xl font-semibold text-gray-800">
            카테고리별 상세
          </h3>
          
          {categoryBreakdown.length === 0 ? (
            <p className="text-center text-gray-500 py-10">지출 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((category) => {
                const percentage = totalExpense > 0 
                  ? (category.total / totalExpense) * 100 
                  : 0;
                
                return (
                  <div key={category.category || "unknown"} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        {category.category || "미분류"}
                      </span>
                      <span className="font-bold text-gray-900">
                        {category.total.toLocaleString("ko-KR")}원
                      </span>
                    </div>
                    
                    <div className="relative h-2.5 w-full rounded-full bg-gray-100">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
