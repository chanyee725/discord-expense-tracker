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

interface MonthlyExpenseChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const MonthlyExpenseChart: React.FC<MonthlyExpenseChartProps> = ({
  series,
  categories,
}) => {
  const chartData = React.useMemo(() => {
    return categories.map((category, index) => {
      const point: Record<string, string | number> = { name: category };
      series.forEach((s) => {
        point[s.name] = s.data[index] ?? 0;
      });
      return point;
    });
  }, [series, categories]);

  const colorMap: Record<string, string> = {
    "지출": "var(--chart-1)",
    "수입": "var(--chart-5)",
  };

  return (
    <div
      data-slot="chart-card"
      className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-6">
        <h3 className="text-[18px] font-bold leading-snug text-text-primary">
          월별 수입/지출 추이
        </h3>
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
              {series.map((s) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  fill={colorMap[s.name] ?? "var(--chart-1)"}
                  radius={[4, 4, 0, 0]}
                  stackId="stack"
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

export default MonthlyExpenseChart;
