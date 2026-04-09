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
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-7xl flex-col p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[22px] font-bold leading-snug text-text-primary">자산 현황</h2>

        <div className="flex gap-3">
          {/* Account Selector */}
          <select
            value={selectedAccount || ""}
            onChange={(e) => setSelectedAccount(e.target.value || null)}
            className="appearance-none rounded-xl border border-border bg-card px-4 py-2 pe-8 text-[13px] font-medium text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          >
            <option value="">전체</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none rounded-xl border border-border bg-card px-4 py-2 pe-8 text-[13px] font-medium text-text-primary outline-hidden transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          >
            {AVAILABLE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>
      </div>

      <div data-slot="section-card" className="flex min-h-0 flex-1 flex-col rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] md:p-6">
        <div className="mb-4 shrink-0 justify-between gap-4 sm:flex">
          <div>
            <h4 className="text-[18px] font-bold leading-snug text-text-primary">
              월별 자산 증가 추이 - {selectedAccountName}
            </h4>
          </div>

          {!selectedAccount && savedGoalAmount > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-[13px] text-text-secondary">
                목표: {savedGoalAmount.toLocaleString()}원
              </div>
              <div className="text-[18px] font-bold text-success">
                {goalProgress.toFixed(1)}% 달성
              </div>
              <div className="text-[12px] text-text-disabled">
                {currentTotalAssets < savedGoalAmount
                  ? `${(savedGoalAmount - currentTotalAssets).toLocaleString()}원 남음`
                  : "목표 달성!"}
              </div>
            </div>
          )}
        </div>

        <div className="relative min-h-0 flex-1">
          <div id="assetChart" className="absolute inset-0 h-full">
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
