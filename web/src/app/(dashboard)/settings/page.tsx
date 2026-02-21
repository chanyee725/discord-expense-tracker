"use client";

import React, { useState } from "react";

interface FixedExpense {
  id: string;
  name: string;
  amount: string;
  category: string;
}

const EXPENSE_CATEGORIES = [
  "주거",
  "구독",
  "통신",
  "보험",
  "교통",
  "교육",
  "기타",
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([
    { id: "1", name: "월세", amount: "500000", category: "주거" },
    { id: "2", name: "넷플릭스", amount: "13500", category: "구독" },
  ]);

  const [monthlyIncome, setMonthlyIncome] = useState("3000000");

  const addFixedExpense = () => {
    const newExpense: FixedExpense = {
      id: Date.now().toString(),
      name: "",
      amount: "",
      category: "기타",
    };
    setFixedExpenses([...fixedExpenses, newExpense]);
  };

  const updateFixedExpense = (
    id: string,
    field: keyof FixedExpense,
    value: string
  ) => {
    setFixedExpenses(
      fixedExpenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  const removeFixedExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter((expense) => expense.id !== id));
  };

  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">설정</h2>
      </div>

       <div className="mb-6">
         <div className="border-b border-gray-200">
           <nav className="flex gap-8">
             <button
               onClick={() => setActiveTab("expenses")}
               className={`px-6 py-3 font-medium transition-colors ${
                 activeTab === "expenses"
                   ? "border-b-2 border-brand-500 text-brand-500"
                   : "text-gray-500 hover:text-gray-700"
               }`}
             >
               고정 지출 관리
             </button>
             <button
               onClick={() => setActiveTab("income")}
               className={`px-6 py-3 font-medium transition-colors ${
                 activeTab === "income"
                   ? "border-b-2 border-brand-500 text-brand-500"
                   : "text-gray-500 hover:text-gray-700"
               }`}
             >
               고정 수익 관리
             </button>
           </nav>
         </div>
       </div>

      {activeTab === "expenses" && (
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-800">고정 지출 관리</h3>
            </div>
             <div className="p-6">
               <div className="flex flex-col gap-5">
                 {fixedExpenses.map((expense) => (
                   <div
                     key={expense.id}
                     className="rounded-lg border border-gray-200 bg-white p-5"
                   >
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                       <div>
                         <label className="mb-2 block text-sm font-medium text-gray-700">
                           이름
                         </label>
                         <input
                           type="text"
                           value={expense.name}
                           onChange={(e) =>
                             updateFixedExpense(
                               expense.id,
                               "name",
                               e.target.value
                             )
                           }
                           className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 focus-visible:outline-none"
                           placeholder="월세"
                         />
                       </div>
                       <div>
                         <label className="mb-2 block text-sm font-medium text-gray-700">
                           금액
                         </label>
                         <input
                           type="number"
                           value={expense.amount}
                           onChange={(e) =>
                             updateFixedExpense(
                               expense.id,
                               "amount",
                               e.target.value
                             )
                           }
                           className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 focus-visible:outline-none"
                           placeholder="500000"
                         />
                         {expense.amount && (
                           <div className="mt-2 text-sm text-gray-500">
                             {formatNumber(expense.amount)}원
                           </div>
                         )}
                       </div>
                       <div>
                         <label className="mb-2 block text-sm font-medium text-gray-700">
                           카테고리
                         </label>
                         <select
                           value={expense.category}
                           onChange={(e) =>
                             updateFixedExpense(
                               expense.id,
                               "category",
                               e.target.value
                             )
                           }
                           className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 focus-visible:outline-none"
                         >
                           {EXPENSE_CATEGORIES.map((category) => (
                             <option key={category} value={category}>
                               {category}
                             </option>
                           ))}
                         </select>
                       </div>
                     </div>
                     <div className="flex justify-end">
                       <button
                         onClick={() => removeFixedExpense(expense.id)}
                         className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                       >
                         삭제
                       </button>
                     </div>
                   </div>
                 ))}
               </div>

              <button
                onClick={addFixedExpense}
                className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                + 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "income" && (
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-800">월 소득</h3>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <label
                  className="mb-2 block text-sm font-medium text-gray-700"
                  htmlFor="monthlyIncome"
                >
                  월급
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="monthlyIncome"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-4.5 pr-4.5 text-gray-700 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 focus-visible:outline-none"
                    placeholder="3000000"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {monthlyIncome && `${formatNumber(monthlyIncome)}원`}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="flex justify-center rounded-lg bg-brand-500 px-6 py-2 font-medium text-white hover:bg-brand-600 transition-colors"
                  type="button"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
