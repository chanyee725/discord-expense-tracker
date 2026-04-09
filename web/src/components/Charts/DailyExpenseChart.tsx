"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/components/ui/utils";

interface DailyExpenseChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  title?: string;
}

const DailyExpenseChart: React.FC<DailyExpenseChartProps> = ({
  series,
  categories,
  title,
}) => {
  const [chartFilter, setChartFilter] = React.useState<
    "expense" | "income" | "all"
  >("expense");

  // Load filter preference from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("dailyChartFilter");
    if (saved === "expense" || saved === "income" || saved === "all") {
      setChartFilter(saved);
    }
  }, []);

  // Save filter preference to localStorage when changed
  const handleFilterChange = (filter: "expense" | "income" | "all") => {
    setChartFilter(filter);
    localStorage.setItem("dailyChartFilter", filter);
  };

  const chartData = React.useMemo(() => {
    return categories.map((category, index) => {
      const point: Record<string, string | number> = { name: category };
      series.forEach((s) => {
        point[s.name] = s.data[index] ?? 0;
      });
      return point;
    });
  }, [series, categories]);

  const visibleSeries = React.useMemo(() => {
    if (chartFilter === "expense") {
      return series.filter((s) => s.name === "지출");
    } else if (chartFilter === "income") {
      return series.filter((s) => s.name === "수입");
    }
    return series;
  }, [series, chartFilter]);

  const colorMap: Record<string, string> = {
    "지출": "var(--chart-expense)",
    "수입": "var(--chart-income)",
  };

  const filterButtons = [
    { key: "expense" as const, label: "지출" },
    { key: "income" as const, label: "수입" },
    { key: "all" as const, label: "전체" },
  ];

  return (
    <div
      data-slot="chart-card"
      className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[18px] font-bold leading-snug text-text-primary">
          {title || "일별 수입/지출 (이번 달)"}
        </h3>

        <div className="flex gap-1 rounded-full bg-surface-muted p-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => handleFilterChange(btn.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all",
                chartFilter === btn.key
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-tertiary",
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 mb-2">
        <div className="min-w-[600px] overflow-x-auto xl:min-w-0">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
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
                  val.toLocaleString("ko-KR") + "원"
                }
              />
              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0).toLocaleString("ko-KR") + " 원",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                  fontSize: 13,
                  fontFamily: "'Pretendard Variable', 'Inter', sans-serif",
                }}
              />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="square"
                iconSize={10}
                wrapperStyle={{
                  fontSize: 13,
                  fontWeight: 500,
                  paddingBottom: 16,
                  color: "var(--text-secondary)",
                }}
              />
              {visibleSeries.map((s) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  fill={colorMap[s.name] ?? "var(--chart-1)"}
                  radius={[4, 4, 0, 0]}
                  stackId={chartFilter === "all" ? "stack" : undefined}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DailyExpenseChart;
