"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/transaction";
import { fetchTransactionsByCategoryAction } from "@/app/(dashboard)/category-expenses/actions";

interface CategoryDetailListProps {
  categoryBreakdown: Array<{ category: string | null; total: number }>;
  totalExpense: number;
  year: number;
  month: number;
}

export default function CategoryDetailList({
  categoryBreakdown,
  totalExpense,
  year,
  month,
}: CategoryDetailListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleCategoryClick = async (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryName);

    if (!transactionsMap[categoryName]) {
      setLoading((prev) => ({ ...prev, [categoryName]: true }));
      try {
        const result = await fetchTransactionsByCategoryAction(year, month, categoryName);
        if (result.success && result.data) {
          setTransactionsMap((prev) => ({ ...prev, [categoryName]: result.data as Transaction[] }));
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading((prev) => ({ ...prev, [categoryName]: false }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {categoryBreakdown.map((category) => {
        const categoryName = category.category || "미분류";
        const percentage = totalExpense > 0 
          ? (category.total / totalExpense) * 100 
          : 0;
        const isExpanded = expandedCategory === categoryName;
        const isLoading = loading[categoryName];
        const transactions = transactionsMap[categoryName] || [];
        
        return (
          <div key={categoryName} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div 
              className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
              onClick={() => handleCategoryClick(categoryName)}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  {categoryName}
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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

            {isExpanded && (
              <div className="mt-3 pl-4 space-y-2 border-l-2 border-gray-100 ml-2">
                {isLoading ? (
                  <div className="text-sm text-gray-500 py-2">Loading transactions...</div>
                ) : transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <div key={txn.id} className="text-sm text-gray-600 flex justify-between">
                      <span className="truncate pr-4">{txn.title}</span>
                      <span className="whitespace-nowrap font-medium">{txn.amount.toLocaleString('ko-KR')}원</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-2">이 카테고리의 거래 내역이 없습니다.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
