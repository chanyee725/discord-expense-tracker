"use client";

import { ApexOptions } from "apexcharts";
import React from "react";
import dynamic from "next/dynamic";

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
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
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
        colors: "#667085",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit, sans-serif",
              color: "#667085",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontFamily: "Outfit, sans-serif",
              color: "#111827",
              offsetY: 10,
              formatter: function (val) {
                return parseInt(String(val)).toLocaleString("ko-KR") + " 원";
              },
            },
            total: {
              show: true,
              label: "총 지출",
              color: "#667085",
              fontFamily: "Outfit, sans-serif",
              formatter: function (w) {
                return (
                  w.globals.seriesTotals
                    .reduce((a: number, b: number) => a + b, 0)
                    .toLocaleString("ko-KR") + " 원"
                );
              },
            },
          },
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
      enabled: false,
    },
  };

  return (
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-lg font-semibold text-gray-800">
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
