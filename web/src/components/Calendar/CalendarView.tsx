"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/types/transaction";
import { useRouter } from "next/navigation";
import { updateTransactionAction, deleteTransactionAction } from "@/app/(dashboard)/transactions/actions";

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
  const [editingTransaction, setEditingTransaction] = useState<CalendarTransaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    amount: 0,
    category: "",
    transaction_date: "",
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
    setEditFormData({
      title: transaction.title || "",
      amount: transaction.amount,
      category: transaction.category || "",
      transaction_date: transaction.transaction_date || "",
    });
    setIsEditPanelOpen(true);
  };

  const handleSave = async () => {
    if (!editingTransaction) return;
    
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
              className="flex h-[110px] flex-col border-r border-stroke bg-white p-1"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentDayDate = current.date(day);
            const isToday = dayjs().isSame(currentDayDate, "day");
            const dayOfWeek = currentDayDate.day();

            const dayTransactions = transactions.filter((t) =>
              dayjs(t.created_at).isSame(currentDayDate, "day")
            );

             const totalAmount = dayTransactions.reduce((sum, t) => {
              const amount = Number(t.amount);
              return sum + (t.type === "지출" ? -amount : amount);
            }, 0);

            return (
              <div
                key={day}
                className={`group relative flex h-[110px] cursor-pointer flex-col border-r border-b border-stroke p-1 transition hover:bg-gray ${
                  isToday ? "bg-gray" : "bg-white"
                }`}
                onClick={() =>
                  setSelectedDate(currentDayDate.format("YYYY-MM-DD"))
                }
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-medium text-sm ${
                        dayOfWeek === 0
                          ? "text-red-600"
                          : dayOfWeek === 6
                          ? "text-blue-600"
                          : "text-black"
                      }`}
                    >
                      {day}
                    </span>
                    {totalAmount !== 0 && (
                       <span className={`text-xs font-medium ${
                         totalAmount > 0 ? "text-blue-600" : "text-red-600"
                       }`}>
                         {totalAmount > 0 ? "+" : ""}{totalAmount.toLocaleString()}
                       </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayTransactions.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransactionClick(t);
                        }}
                        className="flex justify-between text-xs cursor-pointer hover:bg-gray-100 p-0.5 rounded transition-colors"
                      >
                        <span className="truncate text-gray-500">{t.title}</span>
                         <span className={`whitespace-nowrap font-medium ${
                           t.type === "수입" ? "text-blue-600" : "text-red-600"
                         }`}>
                           {Number(t.amount).toLocaleString()}
                         </span>
                      </div>
                    ))}
                    {dayTransactions.length > 3 && (
                      <div className="text-xs text-gray-400 text-right">
                        +{dayTransactions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {Array.from({ length: (7 - ((daysInMonth + firstDayOfMonth) % 7)) % 7 }).map((_, i) => (
             <div
              key={`empty-end-${i}`}
              className="flex h-[110px] flex-col border-r border-stroke bg-white p-1"
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
        {editingTransaction && (
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4">
        <h3 className="font-medium text-black">
                거래 편집
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
              {/* Date Field - Read-only */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  날짜
                </label>
                <div className="text-black">
                  {editFormData.transaction_date}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (실제 기록일: {dayjs(editingTransaction.created_at).format("YYYY.MM.DD")})
                </div>
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
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-black outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                />
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
                className="w-full rounded bg-gray-900 py-2 px-4 font-medium text-white hover:bg-gray-800 transition-colors"
              >
                저장
              </button>
              <button
                onClick={handleDelete}
                className="w-full rounded border border-red-500 py-2 px-4 font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
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
    </div>
  );
}
