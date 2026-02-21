"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";
import { useTheme } from "next-themes";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
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
          colors: isDark ? "#A0AEC0" : "#64748B",
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
          colors: isDark ? "#A0AEC0" : "#64748B",
        },
        formatter: (val) => {
          return val.toLocaleString("ko-KR") + "원";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      labels: {
        colors: isDark ? "#A0AEC0" : "#64748B",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: function (val) {
          return val.toLocaleString("ko-KR") + " 원";
        },
      },
    },
    grid: {
      borderColor: isDark ? "#333" : "#e0e0e0",
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
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            월별 지출 추이
          </h4>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5 h-[355px] w-[105%]">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseChart;
