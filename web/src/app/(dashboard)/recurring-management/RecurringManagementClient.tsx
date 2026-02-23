"use client";

import React, { useState, useEffect } from "react";
import { 
  saveRecurringTransactionAction,
  deleteRecurringTransactionAction,
  getRecurringTransactionsAction,
  getCategoriesForRecurringAction,
  getBankAccountsForDropdownAction
} from "./actions";

interface RecurringTransactionRow {
  id: string;
  type: string;
  day_of_month: number;
  title: string;
  amount: number;
  category: string;
  bank_account: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RecurringTransaction {
  id: string;
  date: number;
  name: string;
  amount: string;
  category: string;
  bankAccount: string;
  type: "expense" | "income";
}

interface RecurringManagementClientProps {
  initialExpenses: RecurringTransactionRow[];
  initialIncome: RecurringTransactionRow[];
}

export default function RecurringManagementClient({ 
  initialExpenses, 
  initialIncome 
}: RecurringManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses");
  
  const mapRowToUI = (row: RecurringTransactionRow): RecurringTransaction => ({
    id: row.id,
    date: row.day_of_month,
    name: row.title,
    amount: row.amount.toString(),
    category: row.category || "기타",
    bankAccount: row.bank_account || "국민은행",
    type: row.type as "expense" | "income",
  });

  const [expenses, setExpenses] = useState<RecurringTransaction[]>([]);
  const [income, setIncome] = useState<RecurringTransaction[]>([]);
  
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [bankAccounts, setBankAccounts] = useState<string[]>([]);

  // Fetch Recurring Transactions
  useEffect(() => {
    const loadRecurringItems = async () => {
      if (activeTab === 'expenses') {
        const result = await getRecurringTransactionsAction('expense');
        if (result.success && result.data) {
          setExpenses(result.data.map(mapRowToUI));
        }
      } else {
        const result = await getRecurringTransactionsAction('income');
        if (result.success && result.data) {
          setIncome(result.data.map(mapRowToUI));
        }
      }
    };
    loadRecurringItems();
  }, [activeTab]);

  // Fetch Categories and Bank Accounts on Mount
  useEffect(() => {
    const loadCategoriesAndAccounts = async () => {
      // Load Categories
      const expenseCatResult = await getCategoriesForRecurringAction('expense');
      if (expenseCatResult.success && expenseCatResult.data) {
        setExpenseCategories(expenseCatResult.data.map(c => c.name));
      }

      const incomeCatResult = await getCategoriesForRecurringAction('income');
      if (incomeCatResult.success && incomeCatResult.data) {
        setIncomeCategories(incomeCatResult.data.map(c => c.name));
      }

      // Load Bank Accounts
      const bankResult = await getBankAccountsForDropdownAction();
      if (bankResult.success && bankResult.data && bankResult.data.length > 0) {
        setBankAccounts(bankResult.data.map(acc => acc.name));
      } else {
        // Fallback to hardcoded list if no bank accounts exist
        setBankAccounts(["국민은행", "신한은행", "우리은행", "하나은행", "카카오뱅크", "토스뱅크"]);
      }
    };
    loadCategoriesAndAccounts();
  }, []);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [editingType, setEditingType] = useState<"expense" | "income" | null>(null);

  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  const handleAddNew = () => {
    const newItem: RecurringTransaction = {
      id: "",
      date: 1,
      name: "",
      amount: "",
      category: activeTab === "expenses" ? (expenseCategories[0] || "기타") : (incomeCategories[0] || "월급"),
      bankAccount: bankAccounts[0] || "국민은행",
      type: activeTab === "expenses" ? "expense" : "income",
    };
    setEditingItem(newItem);
    setEditingType(activeTab === "expenses" ? "expense" : "income");
    setIsPanelOpen(true);
  };

  const handleEdit = (item: RecurringTransaction) => {
    setEditingItem({ ...item });
    setEditingType(item.type);
    setIsPanelOpen(true);
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setEditingType(null);
    }, 300);
  };

  const handleSave = async () => {
    if (!editingItem || !editingType) return;

    const amountNum = parseInt(editingItem.amount) || 0;
    
    if (!editingItem.name || amountNum <= 0) {
      alert("이름과 금액을 입력해주세요.");
      return;
    }

    try {
      const saveData = {
        id: editingItem.id || undefined,
        name: editingItem.name,
        type: editingType,
        amount: amountNum,
        category: editingItem.category,
        bank_account: editingItem.bankAccount,
        day_of_month: editingItem.date
      };

      const result = await saveRecurringTransactionAction(saveData);
      
      if (result.success) {
        // Refetch list after save
        const fetchResult = await getRecurringTransactionsAction(activeTab === 'expenses' ? 'expense' : 'income');
        if (fetchResult.success && fetchResult.data) {
          if (activeTab === 'expenses') {
            setExpenses(fetchResult.data.map(mapRowToUI));
          } else {
            setIncome(fetchResult.data.map(mapRowToUI));
          }
        }
        handleClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!editingItem || !editingItem.id) return;
    
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const result = await deleteRecurringTransactionAction(editingItem.id);
      if (result.success) {
        // Refetch list after delete
        const fetchResult = await getRecurringTransactionsAction(activeTab === 'expenses' ? 'expense' : 'income');
        if (fetchResult.success && fetchResult.data) {
          if (activeTab === 'expenses') {
            setExpenses(fetchResult.data.map(mapRowToUI));
          } else {
            setIncome(fetchResult.data.map(mapRowToUI));
          }
        }
        handleClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const updateField = (field: keyof RecurringTransaction, value: string | number) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const currentList = activeTab === "expenses" ? expenses : income;
  const categories = activeTab === "expenses" ? expenseCategories : incomeCategories;

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
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-sm"
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
                      : "bg-brand-50 text-brand-600"
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

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isPanelOpen ? "pointer-events-auto" : ""}`}>
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                      {bankAccounts.map((acc) => (
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
                  className="w-full rounded-xl bg-brand-500 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  저장하기
                </button>
                
                {editingItem.id && (
                  <button
                    onClick={handleDelete}
                    className="w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    삭제하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
     </div>
    </div>
  );
}
