"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getMonthlyBudgetAction, saveMonthlyBudgetAction } from "@/lib/app-settings-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div data-slot="stat-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-center size-7 rounded-lg bg-brand/10">
          <svg
            className="size-4 text-brand"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.81 2.13-1.88 0-2.69-3.77-2.79-3.77-5.32 0-1.28.96-2.28 2.42-2.54V5h2.67v1.95c1.47.34 2.65 1.34 2.87 3.06h-1.99c-.11-.84-.96-1.52-2.12-1.52-1.32 0-1.92.83-1.92 1.76 0 2.8 3.77 2.69 3.77 5.4 0 1.43-1.15 2.37-2.58 2.54z"
            />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-[12px] text-text-secondary font-medium">이번 달 총 지출</span>
            <h4 className="mt-2 font-bold text-text-primary text-2xl">
              {totalExpense.toLocaleString("ko-KR")}원
            </h4>
            {difference !== null ? (
              <p
                className={`text-sm mt-1 font-medium ${
                  isOverBudget ? "text-destructive" : "text-success"
                }`}
              >
                {isOverBudget
                  ? `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 초과`
                  : `목표보다 ${Math.abs(difference).toLocaleString("ko-KR")}원 절약`}
                <button
                  onClick={openModal}
                  className="text-xs text-brand hover:underline cursor-pointer ms-1"
                >
                  (설정하기)
                </button>
              </p>
            ) : (
              <button
                onClick={openModal}
                className="text-sm mt-1 text-brand hover:underline font-medium"
              >
                목표 금액 설정하기
              </button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>월 목표 지출액 설정</DialogTitle>
            <DialogDescription>
              매월 지출 목표 금액을 설정하면 예산 초과 여부를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-2">
              목표 금액
            </label>
            <Input
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
              placeholder="0"
              className="h-12 rounded-xl text-base"
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button variant="secondary" onClick={closeModal} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSave} className="flex-1">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
