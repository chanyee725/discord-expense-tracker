import React from "react";
import { RecurringTransactionRow } from "@/lib/queries";
import { CalendarDays } from "lucide-react";

interface UpcomingPaymentsCardProps {
  payments: Array<{ template: RecurringTransactionRow; dueDate: Date }>;
}

export default function UpcomingPaymentsCard({
  payments,
}: UpcomingPaymentsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
        <CalendarDays size={22} className="text-gray-700" />
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500">다가오는 정기결제</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl">
            {payments.length}건
          </h4>
        </div>
      </div>
    </div>
  );
}
