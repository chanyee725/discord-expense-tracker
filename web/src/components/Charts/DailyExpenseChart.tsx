"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
  // State for chart filter: "expense", "income", or "all"
  const [chartFilter, setChartFilter] = React.useState<"expense" | "income" | "all">("expense");

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

  // Filter series data based on selection
  const filteredSeries = React.useMemo(() => {
    if (chartFilter === "expense") {
      return series.filter((s) => s.name === "지출");
    } else if (chartFilter === "income") {
      return series.filter((s) => s.name === "수입");
    } else {
      return series; // Show all
    }
  }, [series, chartFilter]);

  // Chart colors based on filter selection
  const chartColors = React.useMemo(() => {
    if (chartFilter === "expense") return ["#EF4444"]; // Red only
    if (chartFilter === "income") return ["#3B82F6"]; // Blue only
    return ["#EF4444", "#3B82F6"]; // Both
  }, [chartFilter]);

  const options: ApexOptions = {
    colors: chartColors,
    chart: {
      fontFamily: "'Pretendard Variable', 'Inter', sans-serif",
      type: "bar",
      height: 335,
      stacked: chartFilter === "all",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "55%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#667085",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#667085",
        },
        formatter: (val) => {
          return val.toLocaleString("ko-KR") + "원";
        },
      },
      min: 0,
      forceNiceScale: true,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "'Pretendard Variable', 'Inter', sans-serif",
      fontWeight: 500,
      fontSize: "14px",
      labels: {
        colors: "#667085",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      y: {
        formatter: function (val) {
          return val.toLocaleString("ko-KR") + " 원";
        },
      },
    },
    grid: {
      borderColor: "#E4E7EC",
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
  };

  return (
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 xl:col-span-12">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            {title || "일별 수입/지출 (이번 달)"}
          </h4>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => handleFilterChange("expense")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              chartFilter === "expense"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            지출
          </button>
          <button
            onClick={() => handleFilterChange("income")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              chartFilter === "income"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            수입
          </button>
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              chartFilter === "all"
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={filteredSeries}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyExpenseChart;
