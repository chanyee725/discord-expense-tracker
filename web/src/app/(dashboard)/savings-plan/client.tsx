"use client";

import { useState } from "react";

interface SavingsPlanClientProps {
  initialSpending: number;
}

export default function SavingsPlanClient({ initialSpending }: SavingsPlanClientProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(1000000);
  
  const difference = initialSpending - monthlyBudget;
  const isOverBudget = difference > 0;
  const percentage = (initialSpending / monthlyBudget) * 100;
  
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">저축 플랜</h2>
      
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">월 예산 설정</h3>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input 
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-8 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="예산 금액 입력"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
          <button 
            className="rounded-lg bg-brand-600 px-6 py-2 font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            onClick={() => {
              alert("예산이 설정되었습니다."); 
            }}
          >
            저장하기
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">이번 달 지출 현황</h3>
        
        <div className="mb-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>설정 예산</span>
            <span className="font-medium text-gray-900">{monthlyBudget.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>현재 지출</span>
            <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
              {initialSpending.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-gray-100">
          <div 
            className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className={`rounded-xl p-4 text-center font-medium ${isOverBudget ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          이번 달 사용 금액이 설정 금액보다 <span className="font-bold">{Math.abs(difference).toLocaleString()}원</span> {isOverBudget ? '초과' : '부족'}합니다.
        </div>
      </div>
    </div>
  );
}
