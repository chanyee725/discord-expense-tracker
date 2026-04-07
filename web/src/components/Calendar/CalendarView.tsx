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
    <div className="rounded-sm border border-stroke bg-white shadow-default">
      <div className="flex items-center justify-between border-b border-stroke px-4 py-4 sm:px-6 xl:px-7.5">
        <h3 className="font-medium text-black">{monthName}</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            수입 {totalIncome.toLocaleString("ko-KR")}원 | 지출{" "}
            {totalExpense.toLocaleString("ko-KR")}원
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            >
              ←
            </button>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-px border-b border-l border-stroke bg-stroke">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`flex h-10 items-center justify-center border-r border-t border-stroke bg-white px-1 py-1 text-sm font-semibold ${
                index === 0
                  ? "text-red-600"
                  : index === 6
                    ? "text-blue-600"
                    : "text-black"
              }`}
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex h-[117px] flex-col border-r border-stroke bg-white p-1"
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
                className={`group relative flex h-[117px] cursor-pointer flex-col border-r border-b border-stroke p-1 transition hover:bg-gray-50 bg-white overflow-hidden`}
                onClick={() => handleDayClick(currentDayDate, dayTransactions)}
              >
                <div className="flex flex-col h-full w-full">
                  <div className="flex items-start justify-end mb-0.5 shrink-0">
                    <span
                      className={`font-medium text-xs flex items-center justify-center ${
                        isToday
                          ? "w-6 h-6 rounded-full border border-brand-500 bg-brand-50 text-brand-600"
                          : dayOfWeek === 0
                            ? "text-red-600"
                            : dayOfWeek === 6
                              ? "text-blue-600"
                              : "text-black"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 flex-1 min-h-0 w-full">
                    {dayTransactions.slice(0, 2).map((t) => {
                      const isFuture = isFutureTransaction(t.created_at);
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransactionClick(t);
                          }}
                          className={`flex flex-col rounded-[3px] bg-gray-50 px-1.5 py-0.5 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-200 transition-all shrink-0 ${isFuture ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-medium text-[11px] text-gray-800 truncate leading-tight flex-1">
                              {t.title}
                            </div>
                            {isFuture && (
                              <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded whitespace-nowrap shrink-0">
                                예정
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-[1px]">
                            <span className="text-[9px] text-gray-500 truncate mr-1 max-w-[60%] leading-none">
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
                              className={`font-medium text-[10px] whitespace-nowrap leading-none ${
                                isSelfTransfer(
                                  t as unknown as Transaction,
                                  bankAccounts,
                                )
                                  ? "text-gray-400"
                                  : t.type === "수입"
                                    ? "text-blue-600"
                                    : "text-red-600"
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
                    <div className="text-[10px] font-medium text-gray-400 text-left mt-auto pt-0.5 px-0.5 shrink-0">
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
              className="flex h-[117px] flex-col border-r border-stroke bg-white p-1"
            />
          ))}
        </div>
      </div>

      {/* Edit Panel Backdrop */}
      {isEditPanelOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleClosePanel}
        />
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isEditPanelOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isEditPanelOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {(editingTransaction || isCreatingNew) && (
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
                <h3 className="font-medium text-black">
                  {isCreatingNew ? "거래 추가" : "거래 편집"}
                </h3>
                <button
                  onClick={handleClosePanel}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Panel Content - Form */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Date Field */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
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
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                    />
                  ) : (
                    <>
                      <div className="text-black">
                        {editFormData.transaction_date}
                      </div>
                      {editingTransaction && (
                        <div className="text-xs text-gray-500 mt-1">
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
                  <label className="mb-2 block text-sm font-medium text-black">
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
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                  />
                </div>

                {/* Amount Field */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
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
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
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
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                  >
                    <option value="">선택하기</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {!isCreatingNew && editFormData.withdrawal_source && (
                    <div className="mt-1 text-xs text-gray-500">
                      OCR:{" "}
                      {editFormData.type === "지출"
                        ? editFormData.withdrawal_source
                        : editFormData.deposit_destination}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
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
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                  >
                    <option value="지출">지출</option>
                    <option value="수입">수입</option>
                  </select>
                </div>

                {/* Category Field */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
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
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
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
              <div className="border-t border-stroke px-6 py-4 flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded bg-brand-500 py-2 px-4 font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  저장
                </button>
                {!isCreatingNew && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded border border-red-500 py-2 px-4 font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={handleClosePanel}
                  className="flex-1 rounded border border-stroke py-2 px-4 font-medium text-black hover:bg-gray-50 transition-colors"
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
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleCloseDayModal}
        />
      )}

      {/* Day Transactions Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isDayModalOpen ? "pointer-events-auto" : ""}`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ${
            isDayModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {isDayModalOpen && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
                <h3 className="font-medium text-black">
                  {dayModalDate} 거래 내역
                </h3>
                <button
                  onClick={handleCloseDayModal}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {dayModalTransactions.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
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
                          className={`cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors ${isFuture ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {txn.title}
                                </h4>
                                {isFuture && (
                                  <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">
                                    예정
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
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
                            <div className="text-right">
                              <p
                                className={`font-semibold ${
                                  isSelfTransfer(
                                    txn as unknown as Transaction,
                                    bankAccounts,
                                  )
                                    ? "text-gray-400"
                                    : txn.type === "수입"
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }`}
                              >
                                {Number(txn.amount).toLocaleString("ko-KR")}원
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
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

              <div className="border-t border-stroke px-6 py-4 space-y-3">
                <button
                  onClick={handleAddTransaction}
                  className="w-full rounded bg-brand-500 py-2 px-4 font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  추가하기
                </button>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    총{" "}
                    {
                      dayModalTransactions.filter(
                        (t) => !isFutureTransaction(t.created_at),
                      ).length
                    }
                    건
                  </span>
                  <div className="flex gap-4">
                    <span className="text-blue-600 font-medium">
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
                    <span className="text-red-600 font-medium">
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
