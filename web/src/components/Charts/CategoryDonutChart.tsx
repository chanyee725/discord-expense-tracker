"use client";

import React from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";

const COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
  "#6B9B7A",
  "#3B82F6",
  "#d4183d",
];

interface CategoryDonutChartProps {
  series: number[];
  labels: string[];
  centerLabel?: string;
  onCategoryClick?: (categoryLabel: string, categoryIndex: number) => void;
}

function DonutSector(props: PieSectorShapeProps, index: number) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle,
    endAngle,
    isActive,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={isActive ? Number(outerRadius) + 6 : Number(outerRadius)}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={COLORS[index % COLORS.length]}
      stroke="var(--card)"
      strokeWidth={2}
    />
  );
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  series,
  labels,
  centerLabel,
  onCategoryClick,
}) => {
  const chartData = React.useMemo(() => {
    return labels.map((label, index) => ({
      name: label,
      value: series[index] ?? 0,
      fill: COLORS[index % COLORS.length],
    }));
  }, [series, labels]);

  const total = React.useMemo(
    () => series.reduce((a, b) => a + b, 0),
    [series],
  );

  const handleClick = (_data: unknown, index: number) => {
    if (onCategoryClick) {
      onCategoryClick(labels[index], index);
    }
  };

  return (
    <div
      data-slot="chart-card"
      className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-6">
        <h3 className="text-[18px] font-bold leading-snug text-text-primary">
          카테고리별 지출
        </h3>
      </div>

      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              shape={DonutSector}
              onClick={handleClick}
              cursor={onCategoryClick ? "pointer" : undefined}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: 12,
                color: "var(--text-secondary)",
                paddingTop: 16,
              }}
            />
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-text-secondary text-[14px]"
            >
              {centerLabel || "총 지출"}
            </text>
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-text-primary text-[18px] font-bold"
            >
              {total.toLocaleString("ko-KR")} 원
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryDonutChart;
