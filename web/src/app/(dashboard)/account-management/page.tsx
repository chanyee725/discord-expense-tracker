"use client";

import React, { useState, useEffect } from "react";
import { getBankAccountsAction, saveBankAccountAction, deleteBankAccountAction } from "./actions";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance: string;
}

const BANK_OPTIONS = [
  "현금",
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "카카오뱅크",
  "토스뱅크",
  "NH농협",
  "IBK기업은행",
  "SC제일은행",
];

const BANK_ICONS: Record<string, string> = {
  "현금": "💵",
  "국민은행": "🏦",
  "신한은행": "🏛️",
  "우리은행": "💼",
  "하나은행": "🏢",
  "카카오뱅크": "📱",
  "토스뱅크": "💳",
  "NH농협": "🌾",
  "IBK기업은행": "🏭",
  "SC제일은행": "💰",
};

export default function AccountManagementPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      const result = await getBankAccountsAction();
      if (result.success && result.data) {
        const mappedAccounts: BankAccount[] = result.data.map((acc: any) => ({
          id: acc.id,
          bankName: acc.bank_name,
          accountName: acc.name,
          accountNumber: acc.account_number || "",
          balance: String(acc.balance),
        }));
        setBankAccounts(mappedAccounts);
      }
    };
    loadAccounts();
  }, []);

  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  const calculateTotalAssets = (): string => {
    const total = bankAccounts.reduce((sum, account) => {
      return sum + (parseInt(account.balance) || 0);
    }, 0);
    return total.toLocaleString("ko-KR");
  };

  const handleAddAccount = () => {
    setEditingAccount({
      id: "",
      bankName: "현금",
      accountName: "",
      accountNumber: "",
      balance: "",
    });
    setIsPanelOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount({ ...account });
    setIsPanelOpen(true);
  };

  const handleClosePanelWithDelay = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingAccount(null);
    }, 300);
  };

  const handleSaveAccount = async () => {
    if (!editingAccount || !editingAccount.accountName) return;

    const accountData = {
      id: editingAccount.id || undefined,
      bank_name: editingAccount.bankName,
      account_name: editingAccount.accountName,
      account_number: editingAccount.accountNumber || null,
      balance: parseInt(editingAccount.balance) || 0,
    };

    const result = await saveBankAccountAction(accountData);

    if (result.success && result.data) {
      const savedAccount: BankAccount = {
        id: result.data.id,
        bankName: result.data.bank_name,
        accountName: result.data.name,
        accountNumber: result.data.account_number || "",
        balance: String(result.data.balance),
      };

      setBankAccounts((prev) => {
        const index = prev.findIndex((acc) => acc.id === savedAccount.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = savedAccount;
          return newList;
        } else {
          return [...prev, savedAccount];
        }
      });
      handleClosePanelWithDelay();
    }
  };

  const handleDeleteAccount = async () => {
    if (!editingAccount || !editingAccount.id) return;

    const result = await deleteBankAccountAction(editingAccount.id);

    if (result.success) {
      setBankAccounts((prev) => prev.filter((acc) => acc.id !== editingAccount.id));
      handleClosePanelWithDelay();
    }
  };

  const updateAccountField = (field: keyof BankAccount, value: string) => {
    if (!editingAccount) return;
    setEditingAccount({ ...editingAccount, [field]: value });
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          계좌 관리
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xl font-semibold text-gray-800">
            등록된 계좌
          </h4>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            계좌 추가
          </button>
        </div>

        <div className="space-y-3">
          {bankAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🏦</div>
              <div className="text-gray-500">등록된 계좌가 없습니다.</div>
              <div className="text-sm text-gray-400 mt-1">새로운 계좌를 추가해보세요.</div>
            </div>
          ) : (
            <>
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleEditAccount(account)}
                  className="group flex items-center justify-between p-5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl shadow-sm border border-gray-100">
                      {BANK_ICONS[account.bankName] || "🏦"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-0.5">{account.accountName}</div>
                      <div className="text-xs font-medium text-gray-500">{account.bankName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="font-bold text-lg text-blue-600">{formatNumber(account.balance)}원</div>
                    <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              {bankAccounts.length > 0 && (
                <div className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-600">총 자산</div>
                    <div className="text-2xl font-bold text-gray-900">{calculateTotalAssets()}원</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClosePanelWithDelay}
        />
      )}

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isPanelOpen ? "pointer-events-auto" : ""}`}>
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {editingAccount ? (
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">계좌 편집</h3>
                  <p className="text-xs text-gray-500 mt-0.5">계좌 정보를 입력합니다</p>
                </div>
                <button
                  onClick={handleClosePanelWithDelay}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">은행</label>
                  <div className="relative">
                    <select
                      value={editingAccount.bankName}
                      onChange={(e) => updateAccountField("bankName", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none appearance-none bg-gray-50/50 focus:bg-white"
                    >
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
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
                  <label className="text-sm font-semibold text-gray-700 block">계좌 이름</label>
                  <input
                    type="text"
                    value={editingAccount.accountName}
                    onChange={(e) => updateAccountField("accountName", e.target.value)}
                    placeholder="예: 급여계좌"
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">계좌번호</label>
                  <input
                    type="text"
                    value={editingAccount.accountNumber}
                    onChange={(e) => updateAccountField("accountNumber", e.target.value)}
                    placeholder="계좌번호를 입력하세요 (선택사항)"
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    디스코드 봇이 수입/지출을 자동 분류하는데 사용됩니다
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">잔액</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editingAccount.balance === '' || editingAccount.balance === '0' 
                        ? '' 
                        : parseInt(editingAccount.balance).toLocaleString('ko-KR')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (value === '' || !isNaN(Number(value))) {
                          updateAccountField("balance", value);
                        }
                      }}
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">원</div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white z-10 pb-8">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveAccount}
                    className="w-full rounded-xl bg-brand-500 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    저장하기
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-white">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">계좌 관리</h3>
                  <p className="text-xs text-gray-500 mt-0.5">계좌를 관리합니다</p>
                </div>
                <button
                  onClick={handleClosePanelWithDelay}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {bankAccounts.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">🏦</div>
                    <div className="text-gray-500">등록된 계좌가 없습니다.</div>
                    <div className="text-sm text-gray-400 mt-1">새로운 계좌를 추가해보세요.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleEditAccount(account)}
                        className="group flex items-center justify-between p-5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl shadow-sm border border-gray-100">
                            {BANK_ICONS[account.bankName] || "🏦"}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 mb-0.5">{account.accountName}</div>
                            <div className="text-xs font-medium text-gray-500">{account.bankName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="font-bold text-lg text-blue-600">{formatNumber(account.balance)}원</div>
                          <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bankAccounts.length > 0 && (
                  <div className="mt-6 p-5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-600">총 자산</div>
                      <div className="text-2xl font-bold text-gray-900">{calculateTotalAssets()}원</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-white z-10 pb-8">
                <button
                  onClick={handleAddAccount}
                  className="w-full rounded-xl bg-brand-500 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/10 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  계좌 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
