"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { fetchMonthlyAssetGrowth, getBankAccountsAction, saveBankAccountAction, deleteBankAccountAction } from "./actions";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  balance: string;
}

const BANK_OPTIONS = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "카카오뱅크",
  "토스뱅크",
  "NH농협",
  "IBK기업은행",
  "SC제일은행",
];

const BANK_ICONS: Record<string, string> = {
  "국민은행": "🏦",
  "신한은행": "🏛️",
  "우리은행": "💼",
  "하나은행": "🏢",
  "카카오뱅크": "📱",
  "토스뱅크": "💳",
  "NH농협": "🌾",
  "IBK기업은행": "🏭",
  "SC제일은행": "💰",
};

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center bg-gray-50 text-gray-400">
      차트 로딩 중...
    </div>
  ),
});

const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

const AVAILABLE_YEARS = [2024, 2025, 2026];

export default function AssetsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMonthlyAssetGrowth(selectedYear);
        // Transform [{month: 1, total_balance: 100}, ...] to [100, ...]
        // Ensure strictly 12 items ordered by month
        const seriesData = Array(12).fill(0);
        data.forEach((item) => {
          if (item.month >= 1 && item.month <= 12) {
            seriesData[item.month - 1] = item.total_balance;
          }
        });
        setChartData(seriesData);
      } catch (error) {
        console.error("Failed to load asset data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  useEffect(() => {
    const loadAccounts = async () => {
      const result = await getBankAccountsAction();
      if (result.success && result.data) {
        const mappedAccounts: BankAccount[] = result.data.map((acc: any) => ({
          id: acc.id,
          bankName: acc.bank_name,
          accountName: acc.name,
          balance: String(acc.balance),
        }));
        setBankAccounts(mappedAccounts);
      }
    };
    loadAccounts();
  }, []);

  // Chart Configuration
  const formatNumber = (value: string): string => {
    const num = parseInt(value) || 0;
    return num.toLocaleString("ko-KR");
  };

  const calculateTotalAssets = (): string => {
    const total = bankAccounts.reduce((sum, account) => {
      return sum + (parseInt(account.balance) || 0);
    }, 0);
    return total.toLocaleString("ko-KR");
  };

  const handleAddAccount = () => {
    setEditingAccount({
      id: "",
      bankName: "국민은행",
      accountName: "",
      balance: "",
    });
    setIsPanelOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount({ ...account });
    setIsPanelOpen(true);
  };

  const handleClosePanelWithDelay = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingAccount(null);
    }, 300);
  };

  const handleSaveAccount = async () => {
    if (!editingAccount || !editingAccount.accountName) return;

    const accountData = {
      id: editingAccount.id || undefined,
      bank_name: editingAccount.bankName,
      account_name: editingAccount.accountName,
      balance: parseInt(editingAccount.balance) || 0,
    };

    const result = await saveBankAccountAction(accountData);

    if (result.success && result.data) {
      const savedAccount: BankAccount = {
        id: result.data.id,
        bankName: result.data.bank_name,
        accountName: result.data.name,
        balance: String(result.data.balance),
      };

      setBankAccounts((prev) => {
        const index = prev.findIndex((acc) => acc.id === savedAccount.id);
        if (index >= 0) {
          const newList = [...prev];
          newList[index] = savedAccount;
          return newList;
        } else {
          return [...prev, savedAccount];
        }
      });
      handleClosePanelWithDelay();
    }
  };

  const handleDeleteAccount = async () => {
    if (!editingAccount || !editingAccount.id) return;

    const result = await deleteBankAccountAction(editingAccount.id);

    if (result.success) {
      setBankAccounts((prev) => prev.filter((acc) => acc.id !== editingAccount.id));
      handleClosePanelWithDelay();
    }
  };

  const updateAccountField = (field: keyof BankAccount, value: string) => {
    if (!editingAccount) return;
    setEditingAccount({ ...editingAccount, [field]: value });
  };

  // Chart Configuration
  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#3C50E0"], // Primary brand color
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: MONTHS,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
        formatter: (val) => {
          return val.toLocaleString("ko-KR");
        },
      },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => {
          return val.toLocaleString("ko-KR") + " 원";
        },
      },
    },
    markers: {
      size: 4,
      colors: ["#fff"],
      strokeColors: ["#3C50E0"],
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
  };

  const series = [
    {
      name: "총 자산",
      data: chartData,
    },
  ];

  const hasData = chartData.some((val) => val > 0);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          자산 관리
        </h2>
        
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {AVAILABLE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
            <svg
              className="fill-current"
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955774 0.545754 0.882227C0.663365 0.691068 0.913365 0.646949 1.10452 0.76456L5.00033 3.10324L8.89614 0.76456C9.0873 0.646949 9.3373 0.691068 9.45491 0.882227C9.57252 1.07339 9.5284 1.32339 9.33724 1.441L5.2209 3.91206C5.14735 3.95618 5.07381 3.9856 5.00033 3.9856C4.92685 3.9856 4.8533 3.95618 4.77975 3.91206L0.663408 1.441C0.57519 1.38216 0.47072 1.25001 0.47072 1.08816Z"
                fill=""
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default md:p-6">
        <div className="mb-4 justify-between gap-4 sm:flex">
          <div>
            <h4 className="text-xl font-semibold text-gray-800">
              월별 자산 증가 추이
            </h4>
          </div>
        </div>

        <div>
          <div id="assetChart" className="-ml-5">
            {loading ? (
              <div className="flex h-[350px] items-center justify-center text-gray-400">
                데이터를 불러오는 중...
              </div>
            ) : chartData.length > 0 ? (
              <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
              />
            ) : (
              <div className="flex h-[350px] items-center justify-center text-gray-500">
                아직 기록된 자산 데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mt-6">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">계좌 목록</h3>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span>+</span>
            <span>계좌 추가</span>
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {bankAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🏦</div>
              <div className="text-gray-500">등록된 계좌가 없습니다.</div>
              <div className="text-sm text-gray-400 mt-1">새로운 계좌를 추가해보세요.</div>
            </div>
          ) : (
            bankAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => handleEditAccount(account)}
                className="group flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl shadow-sm border border-gray-100">
                    {BANK_ICONS[account.bankName] || "🏦"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">{account.accountName}</div>
                    <div className="text-xs font-medium text-gray-500">{account.bankName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="font-bold text-lg text-blue-600">
                    {formatNumber(account.balance)}원
                  </div>
                  <div className="text-gray-300 group-hover:text-gray-600 transition-colors transform group-hover:translate-x-1 duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {bankAccounts.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-600">총 자산</div>
              <div className="text-2xl font-bold text-gray-900">{calculateTotalAssets()}원</div>
            </div>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleClosePanelWithDelay}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {editingAccount && (
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">계좌 편집</h3>
                <p className="text-xs text-gray-500 mt-0.5">계좌 정보를 입력합니다</p>
              </div>
              <button
                onClick={handleClosePanelWithDelay}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">은행</label>
                <div className="relative">
                  <select
                    value={editingAccount.bankName}
                    onChange={(e) => updateAccountField("bankName", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none appearance-none bg-gray-50/50 focus:bg-white"
                  >
                    {BANK_OPTIONS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">계좌 이름</label>
                <input
                  type="text"
                  value={editingAccount.accountName}
                  onChange={(e) => updateAccountField("accountName", e.target.value)}
                  placeholder="예: 급여계좌"
                  className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">잔액</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editingAccount.balance}
                    onChange={(e) => updateAccountField("balance", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 py-3.5 px-4 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all outline-none bg-gray-50/50 focus:bg-white"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">원</div>
                </div>
                {editingAccount.balance && parseInt(editingAccount.balance) > 0 && (
                  <div className="flex justify-end mt-2">
                    <span className="text-sm font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                      {formatNumber(editingAccount.balance)}원
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white z-10 pb-8">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveAccount}
                  className="w-full rounded-xl bg-gray-900 py-4 text-sm font-bold text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  저장하기
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
