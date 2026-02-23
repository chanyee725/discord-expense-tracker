"use client";

import React, { useState, useEffect } from "react";
import {
  getMonthlyBudgetAction,
  saveMonthlyBudgetAction,
} from "./actions";

export default function SettingsPage() {
  const [monthlyBudget, setMonthlyBudget] = useState("2000000");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("2000000");

  useEffect(() => {
    const loadBudget = async () => {
      const result = await getMonthlyBudgetAction();
      if (result.success && result.data) {
        setMonthlyBudget(result.data);
        setBudgetInput(result.data);
      }
    };
    loadBudget();
  }, []);

  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
    setBudgetInput(monthlyBudget);
  };

  const handleBudgetSave = async () => {
    if (budgetInput && parseInt(budgetInput) > 0) {
      await saveMonthlyBudgetAction(budgetInput);
      setMonthlyBudget(budgetInput);
      setIsEditingBudget(false);
    }
  };

  const handleBudgetCancel = () => {
    setIsEditingBudget(false);
  };

  return (
    <div className="mx-auto max-w-screen-xl relative">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">설정</h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
        <div className="max-w-md">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">월 목표 지출액</h3>
            {isEditingBudget ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-4 px-4 text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                  />
                  <div className="absolute right-4 top-4 text-gray-400 font-medium">원</div>
                </div>
                {budgetInput && parseInt(budgetInput) > 0 && (
                  <div className="flex justify-end mt-2">
                    <span className="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                      {formatNumber(budgetInput)}원
                    </span>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBudgetSave}
                    className="flex-1 rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleBudgetCancel}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{formatNumber(monthlyBudget)}원</div>
                </div>
                <button
                  onClick={handleBudgetEdit}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
