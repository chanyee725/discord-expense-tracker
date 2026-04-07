"use client";

import React, { useState, useEffect } from "react";
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
    <div className="mx-auto max-w-screen-2xl relative">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">예산 비율 계산기</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 수입 설정</h3>
            
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                    className="w-full rounded-lg border border-gray-300 py-3 px-4 pr-10 text-gray-900 text-lg font-semibold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none"
                  />
                  <div className="absolute right-4 top-3 text-gray-400 font-medium">원</div>
                </div>
                {recurringIncome.length > 0 && (
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          applyIncomeAmount(parseInt(e.target.value));
                          e.target.value = '';
                        }
                      }}
                      className="h-full rounded-lg border border-gray-300 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none appearance-none pr-8 bg-white"
                      defaultValue=""
                    >
                      <option value="" disabled>불러오기</option>
                      {recurringIncome.map((item) => (
                        <option key={item.id} value={item.amount}>
                          {item.title} ({formatNumber(item.amount)}원)
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {income > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {formatNumber(monthlyIncome)}원
                </div>
              )}
            </div>
          </div>

          {recurringExpenses.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <button
                onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
                className="w-full flex items-center justify-between mb-4 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800">📊 고정비 상세</h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpensesExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isExpensesExpanded && (
                <div>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {recurringExpenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{item.title}</span>
                          <span className="text-xs text-gray-500">매월 {item.day_of_month}일</span>
                        </div>
                        <span className="text-sm font-semibold text-orange-600">{formatNumber(item.amount)}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-3 mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">합계</span>
                    <span className="text-lg font-bold text-orange-600">{formatNumber(totalRecurringExpenses)}원</span>
                  </div>
                  <button
                    onClick={applyFixedExpenses}
                    className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    고정비에 전체 적용
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">📊 예산 비율 계산</h3>
            
            <div className="space-y-5">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
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
                          className="w-32 rounded-lg border border-gray-300 py-1.5 px-3 pr-8 text-sm text-gray-900 text-right font-semibold focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">원</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium w-14 text-right">
                        {category.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className={`h-full ${category.color} transition-all duration-300`}
                      style={{ width: `${Math.min(100, category.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-6 p-5 rounded-xl border-2 ${isValidTotal ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-gray-800">합계</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${isValidTotal ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(totalAmount)}원
                  </span>
                  {isValidTotal ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {!isValidTotal && income > 0 && (
                <p className="text-sm text-red-700 font-medium">
                  합계가 월 수입과 일치해야 합니다. (현재: {formatNumber(totalAmount)}원 / 목표: {formatNumber(income)}원)
                </p>
              )}
              {income === 0 && (
                <p className="text-sm text-gray-600">
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
