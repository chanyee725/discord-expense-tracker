/**
 * Monthly Income/Expense Summary Table
 * 
 * Displays aggregated monthly income and expense data across all years
 * Shows: 월 (YYYY년 M월), 수입, 지출, 순수익 (net income)
 * Includes totals row at bottom
 */

interface MonthlySummaryTableProps {
  data: Array<{
    year: number;
    month: number;
    income: number;
    expense: number;
  }>;
}

export default function MonthlySummaryTable({ data }: MonthlySummaryTableProps) {
  // Calculate totals
  const totalIncome = data.reduce((sum, row) => sum + row.income, 0);
  const totalExpense = data.reduce((sum, row) => sum + row.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div data-slot="section-card" className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
      {/* Title */}
      <h3 className="mb-5 text-text-primary font-bold text-[18px] leading-snug">
        월별 수입/지출 요약
      </h3>

      {/* Table */}
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table data-slot="table" className="w-full caption-bottom text-sm">
          <thead data-slot="table-header" className="[&_tr]:border-b">
            <tr className="border-b border-border">
              <th data-slot="table-head" className="text-text-secondary h-10 px-4 text-start align-middle font-medium text-[12px] uppercase tracking-[0.05em] whitespace-nowrap">
                월
              </th>
              <th data-slot="table-head" className="text-text-secondary h-10 px-4 text-start align-middle font-medium text-[12px] uppercase tracking-[0.05em] whitespace-nowrap">
                수입
              </th>
              <th data-slot="table-head" className="text-text-secondary h-10 px-4 text-start align-middle font-medium text-[12px] uppercase tracking-[0.05em] whitespace-nowrap">
                지출
              </th>
              <th data-slot="table-head" className="text-text-secondary h-10 px-4 text-start align-middle font-medium text-[12px] uppercase tracking-[0.05em] whitespace-nowrap">
                순수익
              </th>
            </tr>
          </thead>
          <tbody data-slot="table-body" className="[&_tr:last-child]:border-0">
            {data.map((row) => {
              const net = row.income - row.expense;
              return (
                <tr key={`${row.year}-${row.month}`} data-slot="table-row" className="border-b border-border transition-colors hover:bg-surface-subtle">
                  <td data-slot="table-cell" className="py-4 px-4 align-middle whitespace-nowrap">
                    <p className="text-text-primary font-medium text-[14px]">
                      {row.year}년 {row.month}월
                    </p>
                  </td>
                  <td data-slot="table-cell" className="py-4 px-4 align-middle whitespace-nowrap">
                    <p className="text-info font-semibold text-[14px]">
                      {row.income.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                  <td data-slot="table-cell" className="py-4 px-4 align-middle whitespace-nowrap">
                    <p className="text-destructive font-semibold text-[14px]">
                      {row.expense.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                  <td data-slot="table-cell" className="py-4 px-4 align-middle whitespace-nowrap">
                    <p className={`font-semibold text-[14px] ${net >= 0 ? "text-success" : "text-destructive"}`}>
                      {net.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr className="bg-surface-subtle font-bold">
              <td className="py-4 px-4">
                <p className="text-text-primary text-[14px]">총합</p>
              </td>
              <td className="py-4 px-4">
                <p className="text-info text-[14px]">
                  {totalIncome.toLocaleString("ko-KR")}원
                </p>
              </td>
              <td className="py-4 px-4">
                <p className="text-destructive text-[14px]">
                  {totalExpense.toLocaleString("ko-KR")}원
                </p>
              </td>
              <td className="py-4 px-4">
                <p className={`text-[14px] ${totalNet >= 0 ? "text-success" : "text-destructive"}`}>
                  {totalNet.toLocaleString("ko-KR")}원
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
