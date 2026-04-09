"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, X, ChevronDown } from "lucide-react";
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
    <div className="mx-auto max-w-(--breakpoint-xl) relative">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[22px] font-bold text-text-primary">반복 관리</h2>
      </div>

      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "expenses"
                  ? "border-b-2 border-brand text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              반복 지출
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "income"
                  ? "border-b-2 border-brand text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              반복 수입
            </button>
          </nav>
        </div>
      </div>

      <div data-slot="card" className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div data-slot="card-header" className="border-b border-border px-6 py-4 flex justify-between items-center bg-surface-subtle">
          <h3 className="font-semibold text-text-primary">
            {activeTab === "expenses" ? "반복 지출 목록" : "반복 수입 목록"}
          </h3>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13px] font-medium text-white hover:bg-brand/90 transition-colors"
          >
            <span>+</span>
            <span>추가하기</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
          {currentList.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-text-secondary">등록된 반복 내역이 없습니다.</div>
              <div className="text-[13px] text-text-disabled mt-1">새로운 내역을 추가해보세요.</div>
            </div>
          ) : (
            currentList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className="group flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface-subtle cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg shadow-xs border border-border ${
                    activeTab === "expenses" 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-surface-muted text-text-primary"
                  }`}>
                    <span className="text-lg">
                      {activeTab === "expenses" ? "💸" : "💰"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] text-text-primary mb-0.5 truncate">{item.name || "이름 없음"}</div>
                    <div className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
                      <span className="bg-surface-muted px-1.5 py-0.5 rounded-xs text-text-secondary">매월 {item.date}일</span>
                      <span className="size-1 bg-icon-muted rounded-full"></span>
                      <span className="truncate">{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ms-2">
                  <div className={`font-bold text-[15px] ${
                    activeTab === "expenses" ? "text-destructive" : "text-info"
                  }`}>
                    {item.amount ? `${formatNumber(item.amount)}원` : "0원"}
                  </div>
                  <div className="text-icon-muted group-hover:text-text-secondary transition-colors">
                    <ChevronRight className="size-4" strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isPanelOpen ? "" : "pointer-events-none"}`}
        onClick={isPanelOpen ? handleClose : undefined}
      >
        {isPanelOpen && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" />
        )}
        <div 
          className={`relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        {editingItem && (
          <div className="flex flex-col h-full bg-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card z-10">
              <div>
                <h3 className="text-[18px] font-bold text-text-primary">
                  {editingType === "expense" ? "지출 편집" : "수입 편집"}
                </h3>
                <p className="text-[12px] text-text-secondary mt-0.5">상세 정보를 수정합니다</p>
              </div>
              <button 
                onClick={handleClose}
                className="flex size-8 items-center justify-center rounded-lg text-icon-default hover:bg-surface-subtle transition-colors"
              >
                <X className="size-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-text-primary block">날짜 (매월)</label>
                <div className="relative group">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingItem.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        updateField("date", 1);
                      } else {
                        const numVal = parseInt(val);
                        if (!isNaN(numVal)) {
                          updateField("date", numVal);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || val < 1) {
                        updateField("date", 1);
                      } else if (val > 31) {
                        updateField("date", 31);
                      }
                    }}
                    className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                  />
                  <div className="absolute right-4 top-3.5 text-text-secondary text-[13px] font-medium">일</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-medium text-text-primary block">이름</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder={editingType === "expense" ? "예: 넷플릭스" : "예: 월급"}
                  className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-medium text-text-primary block">금액</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingItem.amount === '' || editingItem.amount === '0'
                      ? ''
                      : parseInt(editingItem.amount).toLocaleString('ko-KR')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (value === '' || !isNaN(Number(value))) {
                        updateField("amount", value);
                      }
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                  />
                  <div className="absolute right-4 top-3.5 text-text-secondary text-[13px] font-medium">원</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-text-primary block">분류</label>
                  <div className="relative">
                    <select
                      value={editingItem.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden appearance-none bg-card"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-icon-muted pointer-events-none">
                      <ChevronDown className="size-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-text-primary block">은행 계좌</label>
                  <div className="relative">
                    <select
                      value={editingItem.bankAccount}
                      onChange={(e) => updateField("bankAccount", e.target.value)}
                      className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden appearance-none bg-card"
                    >
                      {bankAccounts.map((acc) => (
                        <option key={acc} value={acc}>{acc}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-icon-muted pointer-events-none">
                      <ChevronDown className="size-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-border bg-card z-10 pb-8">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-brand py-4 text-[13px] font-bold text-white hover:bg-brand/90 transition-all duration-200"
                >
                  저장하기
                </button>
                
                {editingItem.id && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-xl py-4 text-[13px] font-medium text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors"
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
