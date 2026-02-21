"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/types/transaction";
import { useRouter } from "next/navigation";

interface CalendarViewProps {
  transactions: Transaction[];
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
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentDayDate = current.date(day);
            const isToday = dayjs().isSame(currentDayDate, "day");
            
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
                className={`flex min-h-[120px] flex-col rounded-lg border p-2 transition-all hover:shadow-md ${
                  isToday
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark"
                }`}
                onClick={() => setSelectedDate(currentDayDate.format("YYYY-MM-DD"))}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                      isToday
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTransactions.length > 0 && (
                    <span className="text-xs font-medium text-gray-500">
                      {totalAmount.toLocaleString()}원
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {dayTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="group relative cursor-pointer truncate rounded bg-gray-50 px-1 py-0.5 text-xs text-gray-700 hover:bg-gray-100 dark:bg-meta-4 dark:text-gray-300"
                      title={`${t.title} - ${Number(t.amount).toLocaleString()}원`}
                    >
                      <span className="font-medium">{t.title}</span>
                      <span className="ml-1 text-gray-500">
                        {Number(t.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
