"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getMonthlyBudgetAction, saveMonthlyBudgetAction } from "@/lib/app-settings-actions";

interface MonthlyExpenseCardProps {
  totalExpense: number;
  budgetGoal?: number | null;
}

export default function MonthlyExpenseCard({
  totalExpense,
  budgetGoal,
}: MonthlyExpenseCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const difference = budgetGoal ? totalExpense - budgetGoal : null;
  const isOverBudget = difference && difference > 0;

  const openModal = async () => {
    const result = await getMonthlyBudgetAction();
    if (result.success && result.data) {
      setBudgetInput(result.data.toString());
    } else if (budgetGoal) {
      setBudgetInput(budgetGoal.toString());
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBudgetInput("");
  };

  const handleSave = async () => {
    if (!budgetInput) return;
    await saveMonthlyBudgetAction(budgetInput);
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <>
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
            {difference !== null ? (
              <p
                className={`text-sm mt-1 font-medium ${
                  isOverBudget ? "text-red-500" : "text-green-500"
                }`}
              >
                {isOverBudget
                  ? `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 초과`
                  : `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 절약`}
                <button
                  onClick={openModal}
                  className="text-xs text-brand-600 hover:underline cursor-pointer ml-1"
                >
                  (설정하기)
                </button>
              </p>
            ) : (
              <button
                onClick={openModal}
                className="text-sm mt-1 text-brand-600 hover:underline font-medium"
              >
                목표 금액 설정하기
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              월 목표 지출액 설정
            </h3>
            
            <div className="mb-8">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                목표 금액
              </label>
              <input
                id="budget"
                type="text"
                value={budgetInput === '' || budgetInput === '0'
                  ? ''
                  : parseInt(budgetInput).toLocaleString('ko-KR')}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (value === '' || !isNaN(Number(value))) {
                    setBudgetInput(value);
                  }
                }}
                className="w-full rounded-xl border border-gray-200 py-4 px-4 text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                placeholder="0"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
