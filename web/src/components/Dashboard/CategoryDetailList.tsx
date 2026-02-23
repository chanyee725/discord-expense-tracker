"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { fetchTransactionsByCategoryAction } from "@/app/(dashboard)/category-expenses/actions";

interface CategoryDetailListProps {
  categoryBreakdown: Array<{ category: string | null; total: number }>;
  totalExpense: number;
  year: number;
  month: number;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryDetailList({
  categoryBreakdown,
  totalExpense,
  year,
  month,
  selectedCategory,
  onSelectCategory,
}: CategoryDetailListProps) {
  const [transactionsMap, setTransactionsMap] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedCategory && !transactionsMap[selectedCategory]) {
        setLoading((prev) => ({ ...prev, [selectedCategory]: true }));
        try {
          const result = await fetchTransactionsByCategoryAction(year, month, selectedCategory);
          if (result.success && result.data) {
            setTransactionsMap((prev) => ({ ...prev, [selectedCategory]: result.data as Transaction[] }));
          }
        } catch (error) {
          console.error("Failed to fetch transactions", error);
        } finally {
          setLoading((prev) => ({ ...prev, [selectedCategory]: false }));
        }
      }
    };

    fetchTransactions();
  }, [selectedCategory, year, month, transactionsMap]);

  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <div className="mb-4 rounded-full bg-gray-50 p-4">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          카테고리를 선택해주세요
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          차트의 카테고리를 클릭하여 지출 목록을 확인하세요
        </p>
      </div>
    );
  }

  const isLoading = loading[selectedCategory];
  const transactions = transactionsMap[selectedCategory] || [];

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          {selectedCategory}
        </h4>
        <button
          onClick={() => onSelectCategory(null)}
          className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="truncate font-medium text-gray-900 text-base">
                  {txn.title}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(txn.created_at).toLocaleDateString("ko-KR", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <span className={`whitespace-nowrap font-bold text-base ${
                txn.deposit_destination ? "text-blue-600" : "text-gray-900"
              }`}>
                {txn.amount.toLocaleString("ko-KR")}원
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          이 카테고리의 거래 내역이 없습니다.
        </div>
      )}
    </div>
  );
}
