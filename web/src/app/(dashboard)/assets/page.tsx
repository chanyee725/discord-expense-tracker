"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { fetchMonthlyAssetGrowth } from "./actions";

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
    </div>
  );
}
