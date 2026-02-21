import { Transaction } from "@/types/transaction";
import dayjs from "dayjs";

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="p-4 text-center text-black dark:text-white">
          등록된 거래가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                날짜
              </th>
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                제목
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                금액
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                카테고리
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, key) => (
              <tr key={transaction.id} className="hover:bg-primary/5 dark:hover:bg-meta-4">
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {dayjs(transaction.created_at).format("YYYY.MM.DD HH:mm")}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {transaction.title || "제목 없음"}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {transaction.amount.toLocaleString("ko-KR")}원
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
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
