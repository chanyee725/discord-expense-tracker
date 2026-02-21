"use client";

import React, { useState } from "react";

interface RecurringTransaction {
  id: string;
  date: number;
  name: string;
  amount: string;
  category: string;
  bankAccount: string;
}

const EXPENSE_CATEGORIES = [
  "주거",
  "구독",
  "통신",
  "보험",
  "교통",
  "교육",
  "기타",
];

const INCOME_CATEGORIES = [
  "월급",
  "부수입",
  "이자",
  "기타",
];

const BANK_ACCOUNTS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "카카오뱅크",
  "토스뱅크",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses");
  
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringTransaction[]>([
    { id: "1", date: 1, name: "월세", amount: "500000", category: "주거", bankAccount: "국민은행" },
    { id: "2", date: 5, name: "넷플릭스", amount: "13500", category: "구독", bankAccount: "신한은행" },
  ]);

  const [recurringIncome, setRecurringIncome] = useState<RecurringTransaction[]>([
    { id: "1", date: 25, name: "월급", amount: "3000000", category: "월급", bankAccount: "국민은행" },
  ]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [editingType, setEditingType] = useState<"expense" | "income" | null>(null);

  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  const handleAddNew = () => {
    const newItem: RecurringTransaction = {
      id: Date.now().toString(),
      date: 1,
      name: "",
      amount: "",
      category: activeTab === "expenses" ? "기타" : "월급",
      bankAccount: "국민은행",
    };
    setEditingItem(newItem);
    setEditingType(activeTab === "expenses" ? "expense" : "income");
    setIsPanelOpen(true);
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem({ ...item });
    setEditingType(activeTab === "expenses" ? "expense" : "income");
    setIsPanelOpen(true);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setEditingType(null);
    }, 300);
  };

  const handleSave = () => {
    if (!editingItem || !editingType) return;

    if (editingType === "expense") {
      setRecurringExpenses(prev => {
        const index = prev.findIndex(item => item.id === editingItem.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = editingItem;
          return newList;
        } else {
          return [...prev, editingItem];
        }
      });
    } else {
      setRecurringIncome(prev => {
        const index = prev.findIndex(item => item.id === editingItem.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = editingItem;
          return newList;
        } else {
          return [...prev, editingItem];
        }
      });
    }
    handleClose();
  };

  const handleDelete = () => {
    if (!editingItem || !editingType) return;

    if (editingType === "expense") {
      setRecurringExpenses(prev => prev.filter(item => item.id !== editingItem.id));
    } else {
      setRecurringIncome(prev => prev.filter(item => item.id !== editingItem.id));
    }
    handleClose();
  };

  const updateField = (field: keyof RecurringTransaction, value: string | number) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const currentList = activeTab === "expenses" ? recurringExpenses : recurringIncome;
  const categories = activeTab === "expenses" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="mx-auto max-w-screen-xl relative">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">반복 관리</h2>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "expenses"
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              반복 지출
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "income"
                  ? "border-b-2 border-brand-500 text-brand-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              반복 수입
            </button>
          </nav>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">
            {activeTab === "expenses" ? "반복 지출 목록" : "반복 수입 목록"}
          </h3>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span>+</span>
            <span>추가하기</span>
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {currentList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-gray-500">등록된 반복 내역이 없습니다.</div>
              <div className="text-sm text-gray-400 mt-1">새로운 내역을 추가해보세요.</div>
            </div>
          ) : (
            currentList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className="group flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm border border-gray-100 ${
                    activeTab === "expenses" 
                      ? "bg-red-50 text-red-600" 
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    <span className="text-xl">
                      {activeTab === "expenses" ? "💸" : "💰"}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">{item.name || "이름 없음"}</div>
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">매월 {item.date}일</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{item.bankAccount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className={`font-bold text-lg ${
                    activeTab === "expenses" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {item.amount ? `${formatNumber(item.amount)}원` : "0원"}
                  </div>
                  <div className="text-gray-300 group-hover:text-gray-600 transition-colors transform group-hover:translate-x-1 duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {editingItem && (
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingType === "expense" ? "지출 편집" : "수입 편집"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">상세 정보를 수정합니다</p>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">날짜 (매월)</label>
                <div className="relative group">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingItem.date}
                    onChange={(e) => updateField("date", Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">일</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">이름</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={editingType === "expense" ? "예: 넷플릭스" : "예: 월급"}
                  className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">금액</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editingItem.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">원</div>
                </div>
                {editingItem.amount && (
                  <div className="flex justify-end mt-2">
                    <span className="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                      {formatNumber(editingItem.amount)}원
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">분류</label>
                  <div className="relative">
                    <select
                      value={editingItem.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none appearance-none bg-gray-50/50 focus:bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">은행 계좌</label>
                  <div className="relative">
                    <select
                      value={editingItem.bankAccount}
                      onChange={(e) => updateField("bankAccount", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none appearance-none bg-gray-50/50 focus:bg-white"
                    >
                      {BANK_ACCOUNTS.map((acc) => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-white z-10 pb-8">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  className="w-full rounded-xl bg-gray-900 py-4 text-sm font-bold text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  저장하기
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
