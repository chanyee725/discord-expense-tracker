"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/types/transaction";
import { useRouter } from "next/navigation";
import {
  updateTransactionAction,
  deleteTransactionAction,
  createTransactionAction,
} from "@/app/(dashboard)/transactions/actions";
import { BankAccountRow } from "@/lib/queries";
import { isSelfTransfer } from "@/lib/transfer-utils";

interface CalendarTransaction extends Omit<Transaction, "created_at"> {
  created_at: string;
}

interface CalendarViewProps {
  transactions: CalendarTransaction[];
  currentDate: string;
  categories: string[];
  totalIncome: number;
  totalExpense: number;
  bankAccounts: BankAccountRow[];
}

const parseTransactionDate = (
  dateStr: string,
  year: number,
  month: number,
): Date | null => {
  if (!dateStr) return null;

  // Try parsing ISO format first (YYYY-MM-DD or YYYY-MM-DD HH:MM)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2})?$/);
  if (isoMatch) {
    const isoYear = parseInt(isoMatch[1], 10);
    const isoMonth = parseInt(isoMatch[2], 10);
    const isoDay = parseInt(isoMatch[3], 10);
    return new Date(isoYear, isoMonth - 1, isoDay);
  }

  // Fall back to Korean format (N월 D일)
  const koreanMatch = dateStr.match(/(\d+)월\s*(\d+)일/);
  if (!koreanMatch) return null;
  const txMonth = parseInt(koreanMatch[1], 10);
  const txDay = parseInt(koreanMatch[2], 10);
  return new Date(year, txMonth - 1, txDay);
};

const parseAccountName = (
  ocrText: string | null,
  bankAccounts: BankAccountRow[],
): string => {
  if (!ocrText) return "계좌 미지정";

  for (const account of bankAccounts) {
    if (account.account_number && ocrText.includes(account.account_number)) {
      return account.name;
    }
  }

  return ocrText;
};

const findMatchingAccountId = (
  ocrText: string | null,
  bankAccounts: BankAccountRow[],
): string => {
  if (!ocrText) return "";

  for (const account of bankAccounts) {
    if (account.account_number && ocrText.includes(account.account_number)) {
      return account.id;
    }
  }

  return "";
};

const isFutureTransaction = (createdAt: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const transactionDate = new Date(createdAt);
  transactionDate.setHours(0, 0, 0, 0);
  return transactionDate > today;
};

export default function CalendarView({
  transactions,
  currentDate,
  categories,
  totalIncome,
  totalExpense,
  bankAccounts,
}: CalendarViewProps) {
  const router = useRouter();
  const current = dayjs(currentDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayModalTransactions, setDayModalTransactions] = useState<
    CalendarTransaction[]
  >([]);
  const [dayModalDate, setDayModalDate] = useState<string>("");
  const [editingTransaction, setEditingTransaction] =
    useState<CalendarTransaction | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    transaction_date: "",
    type: "지출" as "수입" | "지출",
    withdrawal_source: "",
    deposit_destination: "",
    selectedAccountId: "",
  });

  const daysInMonth = current.daysInMonth();
  const firstDayOfMonth = current.startOf("month").day();
  const monthName = current.format("YYYY년 M월");

  const handlePrevMonth = () => {
    const prev = current.subtract(1, "month");
    router.push(`/transactions?year=${prev.year()}&month=${prev.month() + 1}`);
  };

  const handleNextMonth = () => {
    const next = current.add(1, "month");
    router.push(`/transactions?year=${next.year()}&month=${next.month() + 1}`);
  };

  const handleTransactionClick = (transaction: CalendarTransaction) => {
    setEditingTransaction(transaction);
    setIsCreatingNew(false);

    const ocrText =
      transaction.type === "지출"
        ? transaction.withdrawal_source
        : transaction.deposit_destination;

    let matchedAccountId = findMatchingAccountId(ocrText, bankAccounts);

    if (!matchedAccountId && bankAccounts.length > 0) {
      matchedAccountId = bankAccounts[0].id;
    }

    setEditFormData({
      title: transaction.title || "",
      amount: transaction.amount,
      category: transaction.category || "",
      transaction_date: transaction.transaction_date || "",
      type: transaction.type as "수입" | "지출",
      withdrawal_source: transaction.withdrawal_source || "",
      deposit_destination: transaction.deposit_destination || "",
      selectedAccountId: matchedAccountId,
    });
    setIsDayModalOpen(false);
    setIsEditPanelOpen(true);
  };

  const handleAddTransaction = () => {
    if (!selectedDate) return;
    setEditingTransaction(null);
    setIsCreatingNew(true);
    setEditFormData({
      title: "",
      amount: 0,
      category: "",
      transaction_date: selectedDate,
      type: "지출",
      withdrawal_source: "",
      deposit_destination: "",
      selectedAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : "",
    });
    setIsDayModalOpen(false);
    setIsEditPanelOpen(true);
  };

  const handleDayClick = (
    date: dayjs.Dayjs,
    dayTransactions: CalendarTransaction[],
  ) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    setDayModalDate(date.format("YYYY년 M월 D일"));
    // Sort by created_at in descending order (newest first)
    const sortedTransactions = [...dayTransactions].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setDayModalTransactions(sortedTransactions);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setIsDayModalOpen(false);
    setDayModalTransactions([]);
    setDayModalDate("");
  };

  const handleSave = async () => {
    const selectedAccount = bankAccounts.find(
      (acc) => acc.id === editFormData.selectedAccountId,
    );
    const accountName = selectedAccount ? selectedAccount.name : "";

    if (isCreatingNew) {
      const result = await createTransactionAction({
        title: editFormData.title,
        amount: editFormData.amount,
        type: editFormData.type,
        category: editFormData.category,
        transaction_date: editFormData.transaction_date,
        withdrawal_source: editFormData.type === "지출" ? accountName : "",
        deposit_destination: editFormData.type === "수입" ? accountName : "",
      });

      if (result.success) {
        setIsEditPanelOpen(false);
        setIsCreatingNew(false);
        router.refresh();
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    } else if (editingTransaction) {
      const result = await updateTransactionAction(editingTransaction.id, {
        title: editFormData.title,
        amount: editFormData.amount,
        type: editFormData.type,
        category: editFormData.category,
        transaction_date: editFormData.transaction_date,
        withdrawal_source:
          editFormData.type === "지출"
            ? accountName
            : editFormData.deposit_destination,
        deposit_destination:
          editFormData.type === "수입"
            ? accountName
            : editFormData.withdrawal_source,
      });

      if (result.success) {
        setIsEditPanelOpen(false);
        setEditingTransaction(null);
        router.refresh();
      } else {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleDelete = async () => {
    if (!editingTransaction) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const result = await deleteTransactionAction(editingTransaction.id);

    if (result.success) {
      setIsEditPanelOpen(false);
      setEditingTransaction(null);
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setEditingTransaction(null);
    setIsCreatingNew(false);
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div data-slot="calendar-card" className="rounded-2xl bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 xl:px-7.5">
        <h3 className="font-bold text-[18px] text-text-primary">{monthName}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="font-medium text-info">수입 {totalIncome.toLocaleString("ko-KR")}원</span>
            <span className="text-text-disabled">|</span>
            <span className="font-medium text-destructive">지출 {totalExpense.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="flex size-8 items-center justify-center rounded-lg text-icon-default transition-colors hover:bg-surface-subtle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="flex size-8 items-center justify-center rounded-lg text-icon-default transition-colors hover:bg-surface-subtle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div data-slot="calendar-grid" className="grid grid-cols-7 gap-px border-b border-s border-border bg-border">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`flex h-10 items-center justify-center border-e border-t border-border bg-card px-1 py-1 text-[12px] font-semibold ${
                index === 0
                  ? "text-destructive"
                  : index === 6
                    ? "text-info"
                    : "text-text-primary"
              }`}
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex h-[117px] flex-col border-e border-border bg-card p-1"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentDayDate = current.date(day);
            const isToday = dayjs().isSame(currentDayDate, "day");
            const dayOfWeek = currentDayDate.day();

            const currentYear = current.year();
            const currentMonth = current.month() + 1;

            const dayTransactions = transactions.filter((t) => {
              if (!t.transaction_date) return false;
              const txDate = parseTransactionDate(
                t.transaction_date,
                currentYear,
                currentMonth,
              );
              if (!txDate) return false;
              return dayjs(txDate).isSame(currentDayDate, "day");
            });

            // Sort by created_at in descending order (newest first)
            dayTransactions.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            const expenseTotal = dayTransactions
              .filter(
                (t) =>
                  t.type === "지출" &&
                  !isFutureTransaction(t.created_at) &&
                  !isSelfTransfer(t as unknown as Transaction, bankAccounts),
              )
              .reduce((sum, t) => sum + Number(t.amount), 0);

            const incomeTotal = dayTransactions
              .filter(
                (t) =>
                  t.type === "수입" &&
                  !isFutureTransaction(t.created_at) &&
                  !isSelfTransfer(t as unknown as Transaction, bankAccounts),
              )
              .reduce((sum, t) => sum + Number(t.amount), 0);

            return (
              <div
                key={day}
                className={`group relative flex h-[117px] cursor-pointer flex-col overflow-hidden border-e border-b border-border bg-card p-1 transition hover:bg-surface-subtle`}
                onClick={() => handleDayClick(currentDayDate, dayTransactions)}
              >
                <div className="flex h-full w-full flex-col">
                  <div className="mb-0.5 flex shrink-0 items-start justify-end">
                    <span
                      className={`flex items-center justify-center text-xs font-medium ${
                        isToday
                          ? "size-6 rounded-full border border-brand bg-brand/10 text-brand"
                          : dayOfWeek === 0
                            ? "text-destructive"
                            : dayOfWeek === 6
                              ? "text-info"
                              : "text-text-primary"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-0.5 w-full">
                    {dayTransactions.slice(0, 2).map((t) => {
                      const isFuture = isFutureTransaction(t.created_at);
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransactionClick(t);
                          }}
                          className={`flex shrink-0 cursor-pointer flex-col rounded-md bg-surface-subtle px-1.5 py-0.5 border border-border transition-all hover:bg-surface-muted hover:border-border ${isFuture ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 truncate text-[11px] font-medium leading-tight text-text-primary">
                              {t.title}
                            </div>
                            {isFuture && (
                              <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-1 text-[8px] text-amber-700">
                                예정
                              </span>
                            )}
                          </div>
                          <div className="mt-px flex items-center justify-between">
                            <span className="me-1 max-w-[60%] truncate text-[9px] leading-none text-text-secondary">
                              {t.type === "지출"
                                ? parseAccountName(
                                    t.withdrawal_source,
                                    bankAccounts,
                                  )
                                : parseAccountName(
                                    t.deposit_destination,
                                    bankAccounts,
                                  )}
                            </span>
                            <span
                              className={`whitespace-nowrap text-[10px] font-medium leading-none ${
                                isSelfTransfer(
                                  t as unknown as Transaction,
                                  bankAccounts,
                                )
                                  ? "text-text-disabled"
                                  : t.type === "수입"
                                    ? "text-info"
                                    : "text-destructive"
                              }`}
                            >
                              {Number(t.amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {dayTransactions.length > 2 && (
                    <div className="mt-auto shrink-0 px-0.5 pt-0.5 text-start text-[10px] font-medium text-text-secondary">
                      +{dayTransactions.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({
            length: (7 - ((daysInMonth + firstDayOfMonth) % 7)) % 7,
          }).map((_, i) => (
            <div
              key={`empty-end-${i}`}
              className="flex h-[117px] flex-col border-e border-border bg-card p-1"
            />
          ))}
        </div>
      </div>

      {/* Edit Panel Backdrop */}
      {isEditPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={handleClosePanel}
        />
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isEditPanelOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl max-h-[90vh] transform transition-all duration-300 ${
            isEditPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {(editingTransaction || isCreatingNew) && (
            <div className="flex h-full flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-[16px] font-bold text-text-primary">
                  {isCreatingNew ? "거래 추가" : "거래 편집"}
                </h3>
                <button
                  onClick={handleClosePanel}
                  className="flex size-8 items-center justify-center rounded-lg text-icon-default transition-colors hover:bg-surface-subtle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              {/* Panel Content - Form */}
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                {/* Date Field */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    날짜
                  </label>
                  {isCreatingNew ? (
                    <input
                      type="date"
                      value={editFormData.transaction_date}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          transaction_date: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                    />
                  ) : (
                    <>
                      <div className="text-[14px] text-text-primary">
                        {editFormData.transaction_date}
                      </div>
                      {editingTransaction && (
                        <div className="mt-1 text-[12px] text-text-secondary">
                          (실제 기록일:{" "}
                          {dayjs(editingTransaction.created_at).format(
                            "YYYY.MM.DD",
                          )}
                          )
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Name Field */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    이름
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                {/* Amount Field */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    금액
                  </label>
                  <input
                    type="text"
                    value={
                      editFormData.amount === 0
                        ? ""
                        : editFormData.amount.toLocaleString("ko-KR")
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || !isNaN(Number(value))) {
                        setEditFormData({
                          ...editFormData,
                          amount: value === "" ? 0 : Number(value),
                        });
                      }
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    {editFormData.type === "지출" ? "출금 계좌" : "입금 계좌"}
                  </label>
                  <select
                    value={editFormData.selectedAccountId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        selectedAccountId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="">선택하기</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {!isCreatingNew && editFormData.withdrawal_source && (
                    <div className="mt-1 text-[12px] text-text-secondary">
                      OCR:{" "}
                      {editFormData.type === "지출"
                        ? editFormData.withdrawal_source
                        : editFormData.deposit_destination}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    유형
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        type: e.target.value as "수입" | "지출",
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="지출">지출</option>
                    <option value="수입">수입</option>
                  </select>
                </div>

                {/* Category Field */}
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-primary">
                    카테고리
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-[14px] text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="">선택하기</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {editFormData.category &&
                      !categories.includes(editFormData.category) && (
                        <option
                          key={editFormData.category}
                          value={editFormData.category}
                        >
                          {editFormData.category}
                        </option>
                      )}
                  </select>
                </div>
              </div>

              {/* Panel Footer - Buttons */}
              <div className="flex gap-2 border-t border-border px-6 py-4">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-brand/90"
                >
                  저장
                </button>
                {!isCreatingNew && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-xl bg-destructive/10 px-4 py-2.5 text-[14px] font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={handleClosePanel}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-subtle"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day Modal Backdrop */}
      {isDayModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={handleCloseDayModal}
        />
      )}

      {/* Day Transactions Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isDayModalOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-card shadow-2xl max-h-[90vh] transform transition-all duration-300 ${
            isDayModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {isDayModalOpen && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="text-[16px] font-bold text-text-primary">
                  {dayModalDate} 거래 내역
                </h3>
                <button
                  onClick={handleCloseDayModal}
                  className="flex size-8 items-center justify-center rounded-lg text-icon-default transition-colors hover:bg-surface-subtle"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {dayModalTransactions.length === 0 ? (
                  <div className="py-12 text-center text-[13px] text-text-secondary">
                    거래 내역이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayModalTransactions.map((txn) => {
                      const isFuture = isFutureTransaction(txn.created_at);
                      return (
                        <div
                          key={txn.id}
                          onClick={() => handleTransactionClick(txn)}
                          className={`cursor-pointer rounded-xl bg-surface-subtle p-5 transition-colors hover:shadow-[var(--shadow-card)] ${isFuture ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-medium text-text-primary">
                                  {txn.title}
                                </h4>
                                {isFuture && (
                                  <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-amber-700">
                                    예정
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[13px] text-text-secondary">
                                {txn.type === "지출"
                                  ? parseAccountName(
                                      txn.withdrawal_source,
                                      bankAccounts,
                                    )
                                  : parseAccountName(
                                      txn.deposit_destination,
                                      bankAccounts,
                                    )}
                              </p>
                            </div>
                            <div className="text-end">
                              <p
                                className={`text-[14px] font-semibold ${
                                  isSelfTransfer(
                                    txn as unknown as Transaction,
                                    bankAccounts,
                                  )
                                    ? "text-text-disabled"
                                    : txn.type === "수입"
                                      ? "text-info"
                                      : "text-destructive"
                                }`}
                              >
                                {Number(txn.amount).toLocaleString("ko-KR")}원
                              </p>
                              <p className="mt-1 text-[12px] text-text-secondary">
                                {txn.category || "미분류"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-border px-6 py-4">
                <button
                  onClick={handleAddTransaction}
                  className="w-full rounded-xl bg-brand px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-brand/90"
                >
                  추가하기
                </button>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-text-secondary">
                    총{" "}
                    {
                      dayModalTransactions.filter(
                        (t) => !isFutureTransaction(t.created_at),
                      ).length
                    }
                    건
                  </span>
                  <div className="flex gap-4">
                    <span className="font-medium text-info">
                      수입: +
                      {dayModalTransactions
                        .filter(
                          (t) =>
                            t.type === "수입" &&
                            !isFutureTransaction(t.created_at) &&
                            !isSelfTransfer(
                              t as unknown as Transaction,
                              bankAccounts,
                            ),
                        )
                        .reduce((sum, t) => sum + Number(t.amount), 0)
                        .toLocaleString("ko-KR")}
                      원
                    </span>
                    <span className="font-medium text-destructive">
                      지출: -
                      {dayModalTransactions
                        .filter(
                          (t) =>
                            t.type === "지출" &&
                            !isFutureTransaction(t.created_at) &&
                            !isSelfTransfer(
                              t as unknown as Transaction,
                              bankAccounts,
                            ),
                        )
                        .reduce((sum, t) => sum + Number(t.amount), 0)
                        .toLocaleString("ko-KR")}
                      원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
