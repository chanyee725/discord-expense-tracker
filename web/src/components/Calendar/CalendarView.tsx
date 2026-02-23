"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/types/transaction";
import { useRouter } from "next/navigation";
import { updateTransactionAction, deleteTransactionAction, createTransactionAction } from "@/app/(dashboard)/transactions/actions";

interface CalendarTransaction extends Omit<Transaction, "created_at"> {
  created_at: string;
}

interface CalendarViewProps {
  transactions: CalendarTransaction[];
  currentDate: string;
  categories: string[];
  totalIncome: number;
  totalExpense: number;
}

const parseTransactionDate = (dateStr: string, year: number, month: number): Date | null => {
  const match = dateStr.match(/(\d+)월\s*(\d+)일/);
  if (!match) return null;
  const txMonth = parseInt(match[1], 10);
  const txDay = parseInt(match[2], 10);
  return new Date(year, txMonth - 1, txDay); // month is 0-indexed in Date constructor
};

export default function CalendarView({
  transactions,
  currentDate,
  categories,
  totalIncome,
  totalExpense,
}: CalendarViewProps) {
  const router = useRouter();
  const current = dayjs(currentDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayModalTransactions, setDayModalTransactions] = useState<CalendarTransaction[]>([]);
  const [dayModalDate, setDayModalDate] = useState<string>("");
  const [editingTransaction, setEditingTransaction] = useState<CalendarTransaction | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    transaction_date: "",
    type: "지출" as "수입" | "지출",
    withdrawal_source: "",
    deposit_destination: "",
  });

  const daysInMonth = current.daysInMonth();
  const firstDayOfMonth = current.startOf("month").day();
  const monthName = current.format("YYYY년 M월");

  const handlePrevMonth = () => {
    const prev = current.subtract(1, "month");
    router.push(
      `/transactions?year=${prev.year()}&month=${prev.month() + 1}`
    );
  };

  const handleNextMonth = () => {
    const next = current.add(1, "month");
    router.push(
      `/transactions?year=${next.year()}&month=${next.month() + 1}`
    );
  };

  const handleTransactionClick = (transaction: CalendarTransaction) => {
    setEditingTransaction(transaction);
    setIsCreatingNew(false);
    setEditFormData({
      title: transaction.title || "",
      amount: transaction.amount,
      category: transaction.category || "",
      transaction_date: transaction.transaction_date || "",
      type: transaction.type as "수입" | "지출",
      withdrawal_source: transaction.withdrawal_source || "",
      deposit_destination: transaction.deposit_destination || "",
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
    });
    setIsDayModalOpen(false);
    setIsEditPanelOpen(true);
  };

  const handleDayClick = (date: dayjs.Dayjs, dayTransactions: CalendarTransaction[]) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    setDayModalDate(date.format("YYYY년 M월 D일"));
    setDayModalTransactions(dayTransactions);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setIsDayModalOpen(false);
    setDayModalTransactions([]);
    setDayModalDate("");
  };

  const handleSave = async () => {
    if (isCreatingNew) {
      const result = await createTransactionAction({
        title: editFormData.title,
        amount: editFormData.amount,
        type: editFormData.type,
        category: editFormData.category,
        transaction_date: editFormData.transaction_date,
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
        category: editFormData.category,
        transaction_date: editFormData.transaction_date,
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
        <h3 className="font-medium text-black">
          {monthName}
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            수입 {totalIncome.toLocaleString('ko-KR')}원 | 지출 {totalExpense.toLocaleString('ko-KR')}원
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
              const txDate = parseTransactionDate(t.transaction_date, currentYear, currentMonth);
              if (!txDate) return false;
              return dayjs(txDate).isSame(currentDayDate, "day");
            });

            const expenseTotal = dayTransactions
              .filter(t => t.type === "지출")
              .reduce((sum, t) => sum + Number(t.amount), 0);

            const incomeTotal = dayTransactions
              .filter(t => t.type === "수입")
              .reduce((sum, t) => sum + Number(t.amount), 0);

            return (
              <div
                key={day}
                className={`group relative flex h-[117px] cursor-pointer flex-col border-r border-b border-stroke p-2 transition hover:bg-gray-50 bg-white`}
                onClick={() => handleDayClick(currentDayDate, dayTransactions)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-end mb-1">
                    <span
                      className={`font-medium text-sm flex items-center justify-center ${
                        isToday 
                          ? "w-7 h-7 rounded-full border-2 border-brand-500 text-brand-500" 
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
                  
                   <div className="flex flex-col gap-0.5 flex-1 pb-1">
                     {dayTransactions.slice(0, 2).map((t) => (
                       <div
                         key={t.id}
                         onClick={(e) => {
                           e.stopPropagation();
                           handleTransactionClick(t);
                         }}
                         className="mb-1 rounded bg-gray-50 px-2 py-1 text-xs truncate cursor-pointer hover:bg-gray-100 transition-colors"
                       >
                         <div className="font-medium text-gray-800 truncate">{t.title}</div>
                         <div className="flex items-center justify-between mt-0.5">
                           <span className="text-[10px] text-gray-500 truncate mr-1 max-w-[50%]">
                             {t.withdrawal_source || t.deposit_destination || "계좌 미지정"}
                           </span>
                           <span className={`font-medium whitespace-nowrap ${t.type === "수입" ? "text-blue-600" : "text-red-600"}`}>
                             {Number(t.amount).toLocaleString()}원
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                  
                   {dayTransactions.length > 2 && (
                     <div className="text-xs text-gray-400 text-left mt-auto pt-0.5">
                       +{dayTransactions.length - 2} more
                     </div>
                   )}
                </div>
              </div>
            );
          })}
          
          {Array.from({ length: (7 - ((daysInMonth + firstDayOfMonth) % 7)) % 7 }).map((_, i) => (
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

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isEditPanelOpen ? "pointer-events-auto" : ""}`}>
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
                        (실제 기록일: {dayjs(editingTransaction.created_at).format("YYYY.MM.DD")})
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
                   value={editFormData.amount === 0 ? '' : editFormData.amount.toLocaleString('ko-KR')}
                   onChange={(e) => {
                     const value = e.target.value.replace(/,/g, '');
                     if (value === '' || !isNaN(Number(value))) {
                       setEditFormData({
                         ...editFormData,
                         amount: value === '' ? 0 : Number(value),
                       });
                     }
                   }}
                   placeholder="0"
                   className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                 />
               </div>

               {!isCreatingNew && editFormData.withdrawal_source && (
                 <div>
                   <label className="mb-2 block text-sm font-medium text-black">
                     출금 계좌
                   </label>
                   <div className="w-full rounded border border-stroke bg-gray-50 py-2 px-3 text-gray-600">
                     {editFormData.withdrawal_source}
                   </div>
                 </div>
               )}
               {!isCreatingNew && editFormData.deposit_destination && (
                 <div>
                   <label className="mb-2 block text-sm font-medium text-black">
                     입금 계좌
                   </label>
                   <div className="w-full rounded border border-stroke bg-gray-50 py-2 px-3 text-gray-600">
                     {editFormData.deposit_destination}
                   </div>
                 </div>
               )}

              {/* Type Field */}
              {isCreatingNew && (
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
              )}

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
                   {editFormData.category && !categories.includes(editFormData.category) && (
                     <option key={editFormData.category} value={editFormData.category}>
                       {editFormData.category}
                     </option>
                   )}
                 </select>
               </div>
             </div>

            {/* Panel Footer - Buttons */}
            <div className="border-t border-stroke px-6 py-4 space-y-2">
              <button
                onClick={handleSave}
                className="w-full rounded bg-brand-500 py-2 px-4 font-medium text-white hover:bg-brand-600 transition-colors"
              >
                저장
              </button>
              {!isCreatingNew && (
                <button
                  onClick={handleDelete}
                  className="w-full rounded border border-red-500 py-2 px-4 font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  삭제
                </button>
              )}
              <button
                onClick={handleClosePanel}
                className="w-full rounded border border-stroke py-2 px-4 font-medium text-black hover:bg-gray-50 transition-colors"
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
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${isDayModalOpen ? "pointer-events-auto" : ""}`}>
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
                    {dayModalTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        onClick={() => handleTransactionClick(txn)}
                        className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{txn.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {txn.withdrawal_source || txn.deposit_destination || "계좌 미지정"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${txn.type === "수입" ? "text-blue-600" : "text-red-600"}`}>
                              {Number(txn.amount).toLocaleString("ko-KR")}원
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{txn.category || "미분류"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <span className="text-gray-600">총 {dayModalTransactions.length}건</span>
                  <div className="flex gap-4">
                    <span className="text-blue-600 font-medium">
                      수입: +{dayModalTransactions.filter(t => t.type === "수입").reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString("ko-KR")}원
                    </span>
                    <span className="text-red-600 font-medium">
                      지출: -{dayModalTransactions.filter(t => t.type === "지출").reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString("ko-KR")}원
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
