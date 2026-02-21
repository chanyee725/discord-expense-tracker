"use client";

import { useEffect, useState } from "react";

export default function MonthlyExpenseCard({
  totalExpense,
}: {
  totalExpense: number;
}) {
  const [budgetGoal, setBudgetGoal] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("monthlyBudgetGoal");
    if (saved) {
      setBudgetGoal(parseInt(saved));
    }
  }, []);

  const difference = budgetGoal ? totalExpense - budgetGoal : null;
  const isOverBudget = difference && difference > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
        <svg
          className="fill-current"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.81 2.13-1.88 0-2.69-3.77-2.79-3.77-5.32 0-1.28.96-2.28 2.42-2.54V5h2.67v1.95c1.47.34 2.65 1.34 2.87 3.06h-1.99c-.11-.84-.96-1.52-2.12-1.52-1.32 0-1.92.83-1.92 1.76 0 2.8 3.77 2.69 3.77 5.4 0 1.43-1.15 2.37-2.58 2.54z"
            fill=""
          />
        </svg>
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500">이번 달 총 지출</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl">
            {totalExpense.toLocaleString("ko-KR")}원
          </h4>
          {difference !== null && (
            <p
              className={`text-sm mt-1 font-medium ${
                isOverBudget ? "text-red-500" : "text-green-500"
              }`}
            >
              {isOverBudget
                ? `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 초과`
                : `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 절약`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
