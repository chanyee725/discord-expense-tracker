"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";

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
  const options: ApexOptions = {
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
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
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
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
    <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 xl:col-span-7">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            월별 지출 추이
          </h4>
        </div>
      </div>

      <div>
        <div id="chartOne" className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={350}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseChart;
