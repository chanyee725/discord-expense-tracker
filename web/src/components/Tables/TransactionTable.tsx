import { Transaction } from "@/types/transaction";
import dayjs from "dayjs";
import { FileText } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <div data-slot="section-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-surface-muted">
            <FileText className="size-4 text-icon-muted" strokeWidth={2} />
          </div>
          <p className="text-[13px] text-text-secondary">등록된 거래가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-slot="section-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table data-slot="table" className="w-full caption-bottom text-sm">
          <thead data-slot="table-header" className="[&_tr]:border-b">
            <tr className="border-b border-border">
              <th data-slot="table-head" className="h-10 min-w-[150px] px-4 text-start align-middle text-[12px] font-medium uppercase tracking-[0.05em] whitespace-nowrap text-text-secondary xl:ps-11">
                날짜
              </th>
              <th data-slot="table-head" className="h-10 min-w-[220px] px-4 text-start align-middle text-[12px] font-medium uppercase tracking-[0.05em] whitespace-nowrap text-text-secondary">
                제목
              </th>
              <th data-slot="table-head" className="h-10 min-w-[120px] px-4 text-start align-middle text-[12px] font-medium uppercase tracking-[0.05em] whitespace-nowrap text-text-secondary">
                계좌
              </th>
              <th data-slot="table-head" className="h-10 min-w-[120px] px-4 text-start align-middle text-[12px] font-medium uppercase tracking-[0.05em] whitespace-nowrap text-text-secondary">
                금액
              </th>
              <th data-slot="table-head" className="h-10 min-w-[120px] px-4 text-start align-middle text-[12px] font-medium uppercase tracking-[0.05em] whitespace-nowrap text-text-secondary">
                카테고리
              </th>
            </tr>
          </thead>
          <tbody data-slot="table-body" className="[&_tr:last-child]:border-0">
            {transactions.map((transaction) => (
              <tr key={transaction.id} data-slot="table-row" className="border-b border-border transition-colors hover:bg-surface-subtle">
                <td data-slot="table-cell" className="px-4 py-4 align-middle whitespace-nowrap ps-9 xl:ps-11">
                  <p className="text-[14px] text-text-primary">
                    {dayjs(transaction.created_at).format("YYYY.MM.DD HH:mm")}
                  </p>
                </td>
                <td data-slot="table-cell" className="px-4 py-4 align-middle whitespace-nowrap">
                  <p className="text-[14px] font-medium text-text-primary">
                    {transaction.title || "제목 없음"}
                  </p>
                </td>
                <td data-slot="table-cell" className="px-4 py-4 align-middle whitespace-nowrap">
                  <p className="text-[13px] text-text-secondary">
                    {transaction.withdrawal_source || transaction.deposit_destination || "-"}
                  </p>
                </td>
                <td data-slot="table-cell" className="px-4 py-4 align-middle whitespace-nowrap">
                  <p className={`text-[14px] font-semibold ${
                    transaction.deposit_destination ? "text-info" : "text-destructive"
                  }`}>
                    {transaction.amount.toLocaleString("ko-KR")}원
                  </p>
                </td>
                <td data-slot="table-cell" className="px-4 py-4 align-middle whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-medium ${
                    transaction.category
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {transaction.category || "미분류"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
