"use client";

import { useState } from 'react';

interface BankAccount {
  id: string;
  bankName: string;
  balance: number;
}

export default function AssetsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { id: "1", bankName: "국민은행", balance: 5000000 },
    { id: "2", bankName: "신한은행", balance: 2000000 },
  ]);

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const addAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      bankName: "",
      balance: 0,
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, field: keyof BankAccount, value: string | number) => {
    setAccounts(accounts.map(acc =>
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">자산 관리</h2>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-sm font-medium text-gray-500">총 자산</h3>
        <p className="text-3xl font-bold text-gray-900">
          {totalAssets.toLocaleString('ko-KR')}원
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">계좌 목록</h3>
          <button
            onClick={addAccount}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            + 계좌 추가
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="relative rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">은행명</label>
                  <input
                    type="text"
                    value={account.bankName}
                    onChange={(e) => updateAccount(account.id, 'bankName', e.target.value)}
                    className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900"
                    placeholder="은행 이름 입력"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">잔액</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={account.balance || ''}
                      onChange={(e) => updateAccount(account.id, 'balance', Number(e.target.value))}
                      className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900"
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">원</span>
                    </div>
                  </div>
                  {account.balance > 0 && (
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {account.balance.toLocaleString('ko-KR')}원
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end border-t border-gray-200 pt-3">
                <button
                  onClick={() => removeAccount(account.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                >
                  삭제하기
                </button>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p>등록된 계좌가 없습니다.</p>
              <button 
                onClick={addAccount}
                className="mt-2 text-sm font-medium text-gray-900 underline underline-offset-4"
              >
                첫 계좌 등록하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
