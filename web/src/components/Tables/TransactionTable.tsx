import { Transaction } from "@/types/transaction";
import dayjs from "dayjs";

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-6 pb-2.5 sm:px-7.5 xl:pb-1">
        <div className="p-4 text-center text-gray-500">
          등록된 거래가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-6 pb-2.5 sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="min-w-[150px] py-4 px-4 font-medium text-sm text-gray-700 xl:pl-11">
                날짜
              </th>
              <th className="min-w-[220px] py-4 px-4 font-medium text-sm text-gray-700">
                제목
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                금액
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-sm text-gray-700">
                카테고리
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-100 py-5 px-4 pl-9 xl:pl-11">
                  <p className="text-gray-700">
                    {dayjs(transaction.created_at).format("YYYY.MM.DD HH:mm")}
                  </p>
                </td>
                <td className="border-b border-gray-100 py-5 px-4">
                  <p className="text-gray-700">
                    {transaction.title || "제목 없음"}
                  </p>
                </td>
                <td className="border-b border-gray-100 py-5 px-4">
                  <p className={`${
                    transaction.deposit_destination ? "text-blue-600" : "text-red-600"
                  }`}>
                    {transaction.amount.toLocaleString("ko-KR")}원
                  </p>
                </td>
                <td className="border-b border-gray-100 py-5 px-4">
                  <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                    transaction.category ? "bg-success text-success" : "bg-warning text-warning"
                  }`}>
                    {transaction.category || "미분류"}
                  </p>
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
