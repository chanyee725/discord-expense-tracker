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
    <div data-slot="stat-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-center size-7 rounded-lg bg-brand/10">
        <CalendarDays className="size-4 text-brand" strokeWidth={2} />
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-[12px] text-text-secondary font-medium">다가오는 정기결제</span>
          <h4 className="mt-2 font-bold text-text-primary text-2xl">
            {payments.length}건
          </h4>
        </div>
      </div>
    </div>
  );
}
