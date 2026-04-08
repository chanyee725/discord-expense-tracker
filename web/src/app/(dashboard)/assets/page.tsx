"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchMonthlyAssetGrowthByAccount,
  fetchBankAccounts,
  fetchSavingsGoal,
  saveSavingsGoal,
} from "./actions";
import type { BankAccountRow } from "@/lib/queries";

const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

const AVAILABLE_YEARS = [2024, 2025, 2026];

export default function AssetsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<BankAccountRow[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [goalAmount, setGoalAmount] = useState<string>("");
  const [savedGoalAmount, setSavedGoalAmount] = useState<number>(0);

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchBankAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMonthlyAssetGrowthByAccount(
          selectedYear,
          selectedAccount,
        );
        const seriesData = Array(12).fill(0);
        data.forEach((item) => {
          if (item.month >= 1 && item.month <= 12) {
            seriesData[item.month - 1] = item.total_balance / 10000;
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
  }, [selectedYear, selectedAccount]);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await fetchSavingsGoal(selectedYear);
        if (goal) {
          setSavedGoalAmount(goal.goal_amount);
          setGoalAmount(goal.goal_amount.toString());
        } else {
          setSavedGoalAmount(0);
          setGoalAmount("");
        }
      } catch (error) {
        console.error("Failed to load savings goal:", error);
      }
    };

    loadGoal();
  }, [selectedYear]);

  const handleSaveGoal = async () => {
    const amount = parseInt(goalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("올바른 금액을 입력해주세요");
      return;
    }

    const result = await saveSavingsGoal(selectedYear, amount);
    if (result.success) {
      setSavedGoalAmount(amount);
      alert("목표 금액이 저장되었습니다!");
    } else {
      alert("목표 금액 저장에 실패했습니다");
    }
  };

  const selectedAccountName = selectedAccount
    ? accounts.find((a) => a.id === selectedAccount)?.name
    : "전체";

  const rechartsData = React.useMemo(() => {
    return MONTHS.map((month, index) => ({
      name: month,
      "총 자산": chartData[index] ?? 0,
    }));
  }, [chartData]);

  const hasData = chartData.some((val) => val > 0);

  const currentTotalAssets =
    chartData.reduce((sum, val) => sum + val, 0) * 10000;
  const goalProgress =
    savedGoalAmount > 0 ? (currentTotalAssets / savedGoalAmount) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 2xl:p-10 h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800">자산 현황</h2>

        <div className="flex gap-3">
          {/* Account Selector */}
          <div className="relative">
            <select
              value={selectedAccount || ""}
              onChange={(e) => setSelectedAccount(e.target.value || null)}
              className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="">전체</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
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

          {/* Year Selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
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

            {/* TODO: 목표 금액 설정 UI - 디자인 수정 필요 */}
            {/* <div className="flex items-center gap-2">
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="목표 금액"
              className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSaveGoal}
              className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              저장
            </button>
          </div> */}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-default md:p-6 flex-1 flex flex-col min-h-0">
        <div className="mb-4 justify-between gap-4 sm:flex shrink-0">
          <div>
            <h4 className="text-xl font-semibold text-gray-800">
              월별 자산 증가 추이 - {selectedAccountName}
            </h4>
          </div>

          {!selectedAccount && savedGoalAmount > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm text-gray-500">
                목표: {savedGoalAmount.toLocaleString()}원
              </div>
              <div className="text-lg font-bold text-brand-500">
                {goalProgress.toFixed(1)}% 달성
              </div>
              <div className="text-xs text-gray-400">
                {currentTotalAssets < savedGoalAmount
                  ? `${(savedGoalAmount - currentTotalAssets).toLocaleString()}원 남음`
                  : "목표 달성!"}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 relative">
          <div id="assetChart" className="h-full absolute inset-0">
            {loading ? (
              <div className="flex h-full items-center justify-center text-text-tertiary">
                데이터를 불러오는 중...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rechartsData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="5 5"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                    tickFormatter={(val: number) =>
                      val.toLocaleString("ko-KR") + "만"
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      (Number(value ?? 0) * 10000).toLocaleString("ko-KR") +
                        " 원",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-card)",
                      fontSize: 13,
                      fontFamily:
                        "'Pretendard Variable', 'Inter', sans-serif",
                    }}
                  />
                  <Bar
                    dataKey="총 자산"
                    fill="var(--brand)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-tertiary">
                아직 기록된 자산 데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
