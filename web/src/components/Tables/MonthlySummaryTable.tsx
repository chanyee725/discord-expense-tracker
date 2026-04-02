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
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-6 pb-2.5 sm:px-7.5 xl:pb-1">
      {/* Title */}
      <h4 className="mb-6 text-xl font-semibold text-gray-800">
        월별 수입/지출 요약
      </h4>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                월
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                수입
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                지출
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                순수익
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const net = row.income - row.expense;
              return (
                <tr key={`${row.year}-${row.month}`} className="hover:bg-gray-50">
                  <td className="border-b border-gray-100 py-5 px-4">
                    <p className="text-gray-700">
                      {row.year}년 {row.month}월
                    </p>
                  </td>
                  <td className="border-b border-gray-100 py-5 px-4">
                    <p className="text-blue-600">
                      {row.income.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                  <td className="border-b border-gray-100 py-5 px-4">
                    <p className="text-red-600">
                      {row.expense.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                  <td className="border-b border-gray-100 py-5 px-4">
                    <p className={net >= 0 ? "text-green-600" : "text-red-600"}>
                      {net.toLocaleString("ko-KR")}원
                    </p>
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="py-5 px-4">
                <p className="text-gray-800">총합</p>
              </td>
              <td className="py-5 px-4">
                <p className="text-blue-600">
                  {totalIncome.toLocaleString("ko-KR")}원
                </p>
              </td>
              <td className="py-5 px-4">
                <p className="text-red-600">
                  {totalExpense.toLocaleString("ko-KR")}원
                </p>
              </td>
              <td className="py-5 px-4">
                <p className={totalNet >= 0 ? "text-green-600" : "text-red-600"}>
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
