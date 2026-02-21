"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/types/transaction";
import { useRouter } from "next/navigation";

interface CalendarTransaction extends Omit<Transaction, "created_at"> {
  created_at: string;
}

interface CalendarViewProps {
  transactions: CalendarTransaction[];
  currentDate: string;
}

export default function CalendarView({
  transactions,
  currentDate,
}: CalendarViewProps) {
  const router = useRouter();
  const current = dayjs(currentDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
        <h3 className="font-medium text-black dark:text-white">
          {monthName}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            →
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-px border-b border-l border-stroke bg-stroke dark:bg-strokedark">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`flex h-10 items-center justify-center border-r border-t border-stroke bg-white px-1 py-1 text-sm font-semibold dark:border-strokedark dark:bg-boxdark ${
                index === 0
                  ? "text-red-600"
                  : index === 6
                  ? "text-blue-600"
                  : "text-black dark:text-white"
              }`}
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex h-[110px] flex-col border-r border-stroke bg-white p-1 dark:border-strokedark dark:bg-boxdark"
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

            const totalAmount = dayTransactions.reduce(
              (sum, t) => sum + Number(t.amount),
              0
            );

            return (
              <div
                key={day}
                className={`group relative flex h-[110px] cursor-pointer flex-col border-r border-b border-stroke p-1 transition hover:bg-gray dark:border-strokedark dark:bg-boxdark dark:hover:bg-meta-4 ${
                  isToday ? "bg-gray dark:bg-meta-4" : "bg-white"
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
                          : "text-black dark:text-white"
                      }`}
                    >
                      {day}
                    </span>
                    {totalAmount > 0 && (
                       <span className="text-xs font-medium text-red-600">
                         -{totalAmount.toLocaleString()}
                       </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayTransactions.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span className="truncate text-gray-500">{t.title}</span>
                        <span className="whitespace-nowrap font-medium text-red-600">
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
              className="flex h-[110px] flex-col border-r border-stroke bg-white p-1 dark:border-strokedark dark:bg-boxdark"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
