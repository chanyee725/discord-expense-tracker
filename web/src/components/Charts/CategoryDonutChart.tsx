"use client";

import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CategoryDonutChartProps {
  series: number[];
  labels: string[];
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  series,
  labels,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "donut",
    },
    colors: [
      "#10B981",
      "#375E83",
      "#259AE6",
      "#FFA70B",
      "#FF5733",
      "#80CAEE",
      "#8FD0EF",
      "#0FB5AE",
    ],
    labels: labels,
    legend: {
      show: true,
      position: "bottom",
      labels: {
        colors: isDark ? "#A0AEC0" : "#64748B",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: function (val) {
          return val.toLocaleString("ko-KR") + " 원";
        },
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            카테고리별 지출
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>
    </div>
  );
};

export default CategoryDonutChart;
