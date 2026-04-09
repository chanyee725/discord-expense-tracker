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
import { CircleDollarSign } from "lucide-react";

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
        <div className="flex items-center justify-center size-7 rounded-lg bg-surface-muted">
          <CircleDollarSign className="size-4 text-text-primary" strokeWidth={2} />
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
                  className="text-xs text-text-secondary hover:underline cursor-pointer ms-1"
                >
                  (설정하기)
                </button>
              </p>
            ) : (
              <button
                onClick={openModal}
                className="text-sm mt-1 text-text-secondary hover:underline font-medium"
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
