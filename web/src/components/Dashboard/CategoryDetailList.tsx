"use client";

import React, { useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { fetchTransactionsByCategoryAction } from "@/app/(dashboard)/category-expenses/actions";
import { X, Info } from "lucide-react";

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
      <div data-slot="empty-state" className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="size-8 rounded-xl bg-surface-muted flex items-center justify-center mb-3">
          <Info className="size-4 text-text-tertiary" strokeWidth={1.5} />
        </div>
        <h3 className="text-[16px] font-bold text-text-primary tracking-[-0.01em] mb-1.5">
          카테고리를 선택해주세요
        </h3>
        <p className="text-[14px] leading-normal text-text-secondary max-w-[280px]">
          차트의 카테고리를 클릭하여 지출 목록을 확인하세요
        </p>
      </div>
    );
  }

  const isLoading = loading[selectedCategory];
  const transactions = transactionsMap[selectedCategory] || [];

  return (
    <div data-slot="category-detail-list" className="space-y-4">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <h4 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
          <div className="size-3 rounded-full bg-brand"></div>
          {selectedCategory}
        </h4>
        <button
          onClick={() => onSelectCategory(null)}
          className="rounded-full p-1 hover:bg-surface-muted transition-colors"
          aria-label="Close"
        >
          <X className="size-5 text-text-tertiary" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-4 border-surface-muted border-t-brand"></div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pe-2 custom-scrollbar">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              data-slot="list-item"
              className="flex items-center justify-between rounded-xl bg-surface-subtle p-5 hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="truncate font-bold text-text-primary text-[14px] leading-snug">
                  {txn.title}
                </span>
                <span className="text-[12px] text-text-secondary">
                  {txn.transaction_date || new Date(txn.created_at).toLocaleDateString("ko-KR", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <span className={`whitespace-nowrap font-bold text-[14px] ${
                txn.deposit_destination ? "text-info" : "text-text-primary"
              }`}>
                {txn.amount.toLocaleString("ko-KR")}원
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div data-slot="empty-state" className="py-12 text-center text-text-secondary bg-surface-subtle rounded-xl border border-dashed border-border">
          이 카테고리의 거래 내역이 없습니다.
        </div>
      )}
    </div>
  );
}
