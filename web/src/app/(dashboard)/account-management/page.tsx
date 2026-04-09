"use client";

import React, { useState, useEffect } from "react";
import {
  getBankAccountsAction,
  saveBankAccountAction,
  deleteBankAccountAction,
} from "./actions";
import { Plus, ChevronRight, ChevronDown, X } from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  balance: string;
  accountType: string;
  depositBalance: string;
  investmentBalance: string;
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

const INVESTMENT_OPTIONS = [
  "키움증권",
  "삼성증권",
  "미래에셋증권",
  "NH투자증권",
  "한국투자증권",
  "대신증권",
  "KB증권",
  "신한투자증권",
];

const BANK_ICONS: Record<string, string> = {
  현금: "💵",
  국민은행: "🏦",
  신한은행: "🏛️",
  우리은행: "💼",
  하나은행: "🏢",
  카카오뱅크: "📱",
  토스뱅크: "💳",
  NH농협: "🌾",
  IBK기업은행: "🏭",
  SC제일은행: "💰",
};

const INVESTMENT_ICONS: Record<string, string> = {
  키움증권: "📈",
  삼성증권: "💹",
  미래에셋증권: "🌐",
  NH투자증권: "🏛️",
  한국투자증권: "📊",
  대신증권: "📉",
  KB증권: "🔷",
  신한투자증권: "💎",
};

export default function AccountManagementPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"bank" | "investment">("bank");

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
          accountType: acc.account_type || "bank",
          depositBalance: String(acc.deposit_balance || 0),
          investmentBalance: String(acc.investment_balance || 0),
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

  const calculateSubtotal = (type: "bank" | "investment"): string => {
    const total = bankAccounts
      .filter((acc) => acc.accountType === type)
      .reduce((sum, account) => {
        return sum + (parseInt(account.balance) || 0);
      }, 0);
    return total.toLocaleString("ko-KR");
  };

  const calculateInvestmentSubtotals = (): {
    deposit: string;
    investment: string;
  } => {
    const investmentAccounts = bankAccounts.filter(
      (acc) => acc.accountType === "investment",
    );
    const depositTotal = investmentAccounts.reduce(
      (sum, acc) => sum + (parseInt(acc.depositBalance) || 0),
      0,
    );
    const investmentTotal = investmentAccounts.reduce(
      (sum, acc) => sum + (parseInt(acc.investmentBalance) || 0),
      0,
    );
    return {
      deposit: depositTotal.toLocaleString("ko-KR"),
      investment: investmentTotal.toLocaleString("ko-KR"),
    };
  };

  const handleAddAccount = () => {
    setEditingAccount({
      id: "",
      bankName: activeTab === "bank" ? "현금" : "키움증권",
      accountName: "",
      accountNumber: "",
      balance: "",
      accountType: activeTab,
      depositBalance: "",
      investmentBalance: "",
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
      balance:
        editingAccount.accountType === "bank"
          ? parseInt(editingAccount.balance) || 0
          : (parseInt(editingAccount.depositBalance) || 0) +
            (parseInt(editingAccount.investmentBalance) || 0),
      account_type: editingAccount.accountType,
      deposit_balance:
        editingAccount.accountType === "investment"
          ? parseInt(editingAccount.depositBalance) || 0
          : undefined,
      investment_balance:
        editingAccount.accountType === "investment"
          ? parseInt(editingAccount.investmentBalance) || 0
          : undefined,
    };

    const result = await saveBankAccountAction(accountData);

    if (result.success && result.data) {
      const savedAccount: BankAccount = {
        id: result.data.id,
        bankName: result.data.bank_name,
        accountName: result.data.name,
        accountNumber: result.data.account_number || "",
        balance: String(result.data.balance),
        accountType: result.data.account_type || "bank",
        depositBalance: String(result.data.deposit_balance || 0),
        investmentBalance: String(result.data.investment_balance || 0),
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
      setBankAccounts((prev) =>
        prev.filter((acc) => acc.id !== editingAccount.id),
      );
      handleClosePanelWithDelay();
    }
  };

  const updateAccountField = (field: keyof BankAccount, value: string) => {
    if (!editingAccount) return;
    setEditingAccount({ ...editingAccount, [field]: value });
  };

  const filteredAccounts = bankAccounts.filter(
    (acc) => acc.accountType === activeTab,
  );

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h2 className="text-[22px] font-bold leading-snug text-text-primary">계좌 관리</h2>
      </div>

      <div data-slot="section-card" className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              onClick={() => setActiveTab("bank")}
              className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
                activeTab === "bank"
                  ? "bg-card text-text-primary shadow-xs"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              }`}
            >
              은행
            </button>
            <button
              onClick={() => setActiveTab("investment")}
              className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
                activeTab === "investment"
                  ? "bg-card text-text-primary shadow-xs"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              }`}
            >
              투자
            </button>
          </div>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-medium text-white shadow-xs transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" strokeWidth={2} />
            계좌 추가
          </button>
        </div>

        <div className="space-y-3">
          {filteredAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-3 text-4xl">
                {activeTab === "bank" ? "🏦" : "📈"}
              </div>
              <div className="text-[13px] text-text-secondary">
                {activeTab === "bank"
                  ? "등록된 은행 계좌가 없습니다."
                  : "등록된 투자 계좌가 없습니다."}
              </div>
              <div className="mt-1 text-[12px] text-text-disabled">
                새로운 계좌를 추가해보세요.
              </div>
            </div>
          ) : (
            <>
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleEditAccount(account)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-border p-5 transition-all duration-200 hover:bg-surface-subtle"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface-muted text-xl shadow-xs">
                      {BANK_ICONS[account.bankName] ||
                        INVESTMENT_ICONS[account.bankName] ||
                        "🏦"}
                    </div>
                    <div>
                      <div className="mb-0.5 text-[14px] font-semibold text-text-primary">
                        {account.accountName}
                      </div>
                      <div className="text-[12px] font-medium text-text-secondary">
                        {account.bankName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    {account.accountType === "investment" ? (
                      <div className="text-end">
                        <div className="text-[13px] text-text-secondary">
                          예수금{" "}
                          <span className="font-bold text-info">
                            {formatNumber(account.depositBalance)}원
                          </span>
                        </div>
                        <div className="text-[13px] text-text-secondary">
                          투자금{" "}
                          <span className="font-bold text-info">
                            {formatNumber(account.investmentBalance)}원
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[18px] font-bold text-info">
                        {formatNumber(account.balance)}원
                      </div>
                    )}
                    <div className="text-icon-muted transition-colors group-hover:text-icon-default">
                      <ChevronRight className="size-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 rounded-xl bg-surface-subtle border border-border p-5">
                {activeTab === "bank" ? (
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-semibold text-text-secondary">
                      은행 자산
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                      {calculateSubtotal("bank")}원
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-text-secondary">
                        투자 예수금
                      </div>
                      <div className="text-[20px] font-bold text-text-primary">
                        {calculateInvestmentSubtotals().deposit}원
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-text-secondary">
                        투자 평가금액
                      </div>
                      <div className="text-[20px] font-bold text-text-primary">
                        {calculateInvestmentSubtotals().investment}원
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={handleClosePanelWithDelay}
        />
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isPanelOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {editingAccount ? (
            <div className="flex flex-col min-h-0 flex-1 bg-card">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card z-10">
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary">계좌 편집</h3>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    계좌 정보를 입력합니다
                  </p>
                </div>
                <button
                  onClick={handleClosePanelWithDelay}
                  className="flex size-8 items-center justify-center rounded-lg text-icon-default hover:bg-surface-subtle transition-colors"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-text-primary block">
                    {editingAccount.accountType === "bank" ? "은행" : "증권사"}
                  </label>
                  <div className="relative">
                    <select
                      value={editingAccount.bankName}
                      onChange={(e) =>
                        updateAccountField("bankName", e.target.value)
                      }
                      className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden appearance-none bg-card"
                    >
                      {(editingAccount.accountType === "bank"
                        ? BANK_OPTIONS
                        : INVESTMENT_OPTIONS
                      ).map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-icon-muted pointer-events-none">
                      <ChevronDown className="size-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-text-primary block">
                    계좌 이름
                  </label>
                  <input
                    type="text"
                    value={editingAccount.accountName}
                    onChange={(e) =>
                      updateAccountField("accountName", e.target.value)
                    }
                    placeholder="예: 급여계좌"
                    className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-text-primary block">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    value={editingAccount.accountNumber}
                    onChange={(e) =>
                      updateAccountField("accountNumber", e.target.value)
                    }
                    placeholder="계좌번호를 입력하세요 (선택사항)"
                    className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                  />
                  <p className="text-[12px] text-text-secondary">
                    디스코드 봇이 수입/지출을 자동 분류하는데 사용됩니다
                  </p>
                </div>

                {editingAccount.accountType === "bank" ? (
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-text-primary block">
                      잔액
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          editingAccount.balance === "" ||
                          editingAccount.balance === "0"
                            ? ""
                            : parseInt(editingAccount.balance).toLocaleString(
                                "ko-KR",
                              )
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, "");
                          if (value === "" || !isNaN(Number(value))) {
                            updateAccountField("balance", value);
                          }
                        }}
                        placeholder="0"
                        className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                      />
                      <div className="absolute right-4 top-3.5 text-text-secondary text-[13px] font-medium">
                        원
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-text-primary block">
                        예수금
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            editingAccount.depositBalance === "" ||
                            editingAccount.depositBalance === "0"
                              ? ""
                              : parseInt(
                                  editingAccount.depositBalance,
                                ).toLocaleString("ko-KR")
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (value === "" || !isNaN(Number(value))) {
                              updateAccountField("depositBalance", value);
                            }
                          }}
                          placeholder="0"
                          className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                        />
                        <div className="absolute right-4 top-3.5 text-text-secondary text-[13px] font-medium">
                          원
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-text-primary block">
                        투자금 (평가금액)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            editingAccount.investmentBalance === "" ||
                            editingAccount.investmentBalance === "0"
                              ? ""
                              : parseInt(
                                  editingAccount.investmentBalance,
                                ).toLocaleString("ko-KR")
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (value === "" || !isNaN(Number(value))) {
                              updateAccountField("investmentBalance", value);
                            }
                          }}
                          placeholder="0"
                          className="w-full rounded-xl border border-border py-3.5 px-4 text-text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-hidden bg-card"
                        />
                        <div className="absolute right-4 top-3.5 text-text-secondary text-[13px] font-medium">
                          원
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-border bg-card z-10">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveAccount}
                    className="w-full rounded-xl bg-brand py-4 text-[13px] font-bold text-white hover:bg-brand/90 transition-all duration-200"
                  >
                    저장하기
                  </button>

                  {editingAccount.id && (
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full rounded-xl py-3 text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      삭제하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-card">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card z-10">
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary">계좌 관리</h3>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    계좌를 관리합니다
                  </p>
                </div>
                <button
                  onClick={handleClosePanelWithDelay}
                  className="flex size-8 items-center justify-center rounded-lg text-icon-default hover:bg-surface-subtle transition-colors"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {filteredAccounts.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">
                      {activeTab === "bank" ? "🏦" : "📈"}
                    </div>
                    <div className="text-text-secondary">
                      {activeTab === "bank"
                        ? "등록된 은행 계좌가 없습니다."
                        : "등록된 투자 계좌가 없습니다."}
                    </div>
                    <div className="text-[13px] text-text-disabled mt-1">
                      새로운 계좌를 추가해보세요.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleEditAccount(account)}
                        className="group flex items-center justify-between p-5 rounded-xl hover:bg-surface-subtle cursor-pointer transition-all duration-200 border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-surface-muted text-xl shadow-xs border border-border">
                            {BANK_ICONS[account.bankName] ||
                              INVESTMENT_ICONS[account.bankName] ||
                              "🏦"}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary mb-0.5">
                              {account.accountName}
                            </div>
                            <div className="text-[12px] font-medium text-text-secondary">
                              {account.bankName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          {account.accountType === "investment" ? (
                            <div className="text-end">
                              <div className="text-[13px] text-text-secondary">
                                예수금{" "}
                                <span className="font-bold text-info">
                                  {formatNumber(account.depositBalance)}원
                                </span>
                              </div>
                              <div className="text-[13px] text-text-secondary">
                                투자금{" "}
                                <span className="font-bold text-info">
                                  {formatNumber(account.investmentBalance)}원
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="font-bold text-[18px] text-info">
                              {formatNumber(account.balance)}원
                            </div>
                          )}
                          <div className="text-icon-muted group-hover:text-text-secondary transition-colors">
                            <ChevronRight className="size-5" strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredAccounts.length > 0 && (
                  <div className="mt-6 p-5 rounded-xl bg-surface-subtle border border-border">
                    {activeTab === "bank" ? (
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-semibold text-text-secondary">
                          은행 자산
                        </div>
                        <div className="text-[22px] font-bold text-text-primary">
                          {calculateSubtotal("bank")}원
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[13px] font-semibold text-text-secondary">
                            투자 예수금
                          </div>
                          <div className="text-[20px] font-bold text-text-primary">
                            {calculateInvestmentSubtotals().deposit}원
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-[13px] font-semibold text-text-secondary">
                            투자 평가금액
                          </div>
                          <div className="text-[20px] font-bold text-text-primary">
                            {calculateInvestmentSubtotals().investment}원
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-card z-10 pb-8">
                <button
                  onClick={handleAddAccount}
                  className="w-full rounded-xl bg-brand py-4 text-[13px] font-bold text-white hover:bg-brand/90 transition-all duration-200"
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
