"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { 
  fetchRecurringIncome, 
  fetchRecurringExpenses, 
  saveBudgetSettings, 
  loadBudgetSettings 
} from "./actions";
import type { RecurringTransactionRow } from "@/lib/queries";

export default function BudgetCalculatorPage() {
  const [monthlyIncome, setMonthlyIncome] = useState("3000000");
  const [savingsAmount, setSavingsAmount] = useState(900000);
  const [fixedAmount, setFixedAmount] = useState(1200000);
  const [variableAmount, setVariableAmount] = useState(600000);
  const [emergencyAmount, setEmergencyAmount] = useState(300000);
  
  const [recurringIncome, setRecurringIncome] = useState<RecurringTransactionRow[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringTransactionRow[]>([]);
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [income, expenses, savedSettings] = await Promise.all([
        fetchRecurringIncome(),
        fetchRecurringExpenses(),
        loadBudgetSettings(),
      ]);
      setRecurringIncome(income);
      setRecurringExpenses(expenses);
      
      if (savedSettings) {
        setMonthlyIncome(savedSettings.monthlyIncome.toString());
        setSavingsAmount(savedSettings.savingsAmount);
        setFixedAmount(savedSettings.fixedAmount);
        setVariableAmount(savedSettings.variableAmount);
        setEmergencyAmount(savedSettings.emergencyAmount);
      }
      
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      saveBudgetSettings({
        monthlyIncome: parseInt(monthlyIncome) || 0,
        savingsAmount,
        fixedAmount,
        variableAmount,
        emergencyAmount,
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [monthlyIncome, savingsAmount, fixedAmount, variableAmount, emergencyAmount, isLoaded]);

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseInt(value) || 0 : value;
    return num.toLocaleString("ko-KR");
  };

  const applyIncomeAmount = (amount: number) => {
    setMonthlyIncome(amount.toString());
  };

  const totalRecurringExpenses = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const applyFixedExpenses = () => {
    if (totalRecurringExpenses > 0) {
      setFixedAmount(totalRecurringExpenses);
      autoDistributeRemaining(savingsAmount, totalRecurringExpenses);
    }
  };

  const autoDistributeRemaining = (savings: number, fixed: number) => {
    const income = parseInt(monthlyIncome) || 0;
    if (income <= 0) return;
    
    const remaining = income - savings - fixed;
    if (remaining < 0) {
      setVariableAmount(0);
      setEmergencyAmount(0);
    } else {
      const half = Math.floor(remaining / 2);
      setVariableAmount(half);
      setEmergencyAmount(remaining - half);
    }
  };

  const handleSavingsChange = (newAmount: number) => {
    setSavingsAmount(newAmount);
    autoDistributeRemaining(newAmount, fixedAmount);
  };

  const handleFixedChange = (newAmount: number) => {
    setFixedAmount(newAmount);
    autoDistributeRemaining(savingsAmount, newAmount);
  };

  const handleVariableChange = (newAmount: number) => {
    setVariableAmount(newAmount);
    const income = parseInt(monthlyIncome) || 0;
    if (income > 0) {
      const remainingForEmergency = income - savingsAmount - fixedAmount - newAmount;
      setEmergencyAmount(Math.max(0, remainingForEmergency));
    }
  };

  const handleEmergencyChange = (newAmount: number) => {
    setEmergencyAmount(newAmount);
    const income = parseInt(monthlyIncome) || 0;
    if (income > 0) {
      const remainingForVariable = income - savingsAmount - fixedAmount - newAmount;
      setVariableAmount(Math.max(0, remainingForVariable));
    }
  };

  const income = parseInt(monthlyIncome) || 0;
  const totalAmount = savingsAmount + fixedAmount + variableAmount + emergencyAmount;
  const isValidTotal = income > 0 && totalAmount === income;
  
  const savingsPercent = income > 0 ? (savingsAmount / income) * 100 : 0;
  const fixedPercent = income > 0 ? (fixedAmount / income) * 100 : 0;
  const variablePercent = income > 0 ? (variableAmount / income) * 100 : 0;
  const emergencyPercent = income > 0 ? (emergencyAmount / income) * 100 : 0;

  const categories = [
    { name: "저축", amount: savingsAmount, setAmount: handleSavingsChange, percent: savingsPercent, color: "bg-blue-500", autoDistribute: true },
    { name: "고정비", amount: fixedAmount, setAmount: handleFixedChange, percent: fixedPercent, color: "bg-orange-500", autoDistribute: true },
    { name: "변동비/식비", amount: variableAmount, setAmount: handleVariableChange, percent: variablePercent, color: "bg-green-500", autoDistribute: false },
    { name: "여유자금", amount: emergencyAmount, setAmount: handleEmergencyChange, percent: emergencyPercent, color: "bg-gray-500", autoDistribute: false },
  ];

  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) relative">
      <div className="mb-6">
        <h2 className="text-[22px] font-bold leading-snug text-text-primary">예산 비율 계산기</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div data-slot="section-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-[18px] font-bold leading-snug text-text-primary">💰 수입 설정</h3>
            
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
                월 수입
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={monthlyIncome === '0' || monthlyIncome === '' ? '' : parseInt(monthlyIncome).toLocaleString('ko-KR')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (value === '' || !isNaN(Number(value))) {
                        setMonthlyIncome(value === '' ? '0' : value);
                      }
                    }}
                    placeholder="3,000,000"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 pe-10 text-[18px] font-semibold text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                  <div className="absolute end-4 top-3 font-medium text-text-disabled">원</div>
                </div>
                {recurringIncome.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        applyIncomeAmount(parseInt(e.target.value));
                        e.target.value = '';
                      }
                    }}
                    className="h-full appearance-none rounded-xl border border-border bg-card px-3 py-3 pe-8 text-[13px] font-medium text-text-primary outline-hidden transition hover:bg-surface-subtle focus:border-brand focus:ring-4 focus:ring-brand/10"
                    defaultValue=""
                  >
                    <option value="" disabled>불러오기</option>
                    {recurringIncome.map((item) => (
                      <option key={item.id} value={item.amount}>
                        {item.title} ({formatNumber(item.amount)}원)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {income > 0 && (
                <div className="mt-2 text-[13px] text-text-secondary">
                  {formatNumber(monthlyIncome)}원
                </div>
              )}
            </div>
          </div>

          {recurringExpenses.length > 0 && (
            <div data-slot="section-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
              <button
                onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
                className="mb-4 flex w-full items-center justify-between text-start"
              >
                <h3 className="text-[18px] font-bold leading-snug text-text-primary">📊 고정비 상세</h3>
                <ChevronDown className={`size-5 text-icon-default transition-transform ${isExpensesExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
              
              {isExpensesExpanded && (
                <div>
                  <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
                    {recurringExpenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-warning/5 px-3 py-2 border border-warning/10">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-text-primary">{item.title}</span>
                          <span className="text-[12px] text-text-secondary">매월 {item.day_of_month}일</span>
                        </div>
                        <span className="text-[13px] font-semibold text-warning">{formatNumber(item.amount)}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[13px] font-bold text-text-primary">합계</span>
                    <span className="text-[18px] font-bold text-warning">{formatNumber(totalRecurringExpenses)}원</span>
                  </div>
                  <button
                    onClick={applyFixedExpenses}
                    className="w-full rounded-xl bg-warning px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-warning/90"
                  >
                    고정비에 전체 적용
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div data-slot="section-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-6 text-[18px] font-bold leading-snug text-text-primary">📊 예산 비율 계산</h3>
            
            <div className="space-y-5">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[13px] font-semibold text-text-primary">
                      {category.name}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={category.amount === 0 ? '' : category.amount.toLocaleString('ko-KR')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, '');
                            if (value === '' || !isNaN(Number(value))) {
                              category.setAmount(value === '' ? 0 : Math.max(0, parseInt(value)));
                            }
                          }}
                          placeholder="0"
                          className="w-32 rounded-xl border border-border bg-card px-3 py-1.5 pe-8 text-end text-[13px] font-semibold text-text-primary outline-hidden transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[12px] text-text-secondary">원</span>
                      </div>
                      <span className="w-14 text-end text-[13px] font-medium text-text-secondary">
                        {category.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-10 overflow-hidden rounded-xl bg-surface-muted">
                    <div 
                      className={`h-full ${category.color} transition-all duration-300`}
                      style={{ width: `${Math.min(100, category.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-6 rounded-xl border-2 p-5 ${isValidTotal ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[14px] font-bold text-text-primary">합계</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[20px] font-bold ${isValidTotal ? 'text-success' : 'text-destructive'}`}>
                    {formatNumber(totalAmount)}원
                  </span>
                  {isValidTotal ? (
                    <Check className="size-6 text-success" strokeWidth={2} />
                  ) : (
                    <X className="size-6 text-destructive" strokeWidth={2} />
                  )}
                </div>
              </div>
              {!isValidTotal && income > 0 && (
                <p className="text-[13px] font-medium text-destructive">
                  합계가 월 수입과 일치해야 합니다. (현재: {formatNumber(totalAmount)}원 / 목표: {formatNumber(income)}원)
                </p>
              )}
              {income === 0 && (
                <p className="text-[13px] text-text-secondary">
                  월 수입을 먼저 입력해주세요.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
