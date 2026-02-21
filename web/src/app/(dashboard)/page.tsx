import React from "react";
import {
  getMonthlyExpenses,
  getCategoryBreakdown,
  getDailyExpenses,
  getMonthlyTransactionStats,
} from "@/lib/queries";
import MonthlyExpenseChart from "@/components/Charts/MonthlyExpenseChart";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import DailyExpenseChart from "@/components/Charts/DailyExpenseChart";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month() + 1;
  const daysInMonth = now.daysInMonth();

  const [
    monthlyStats,
    monthlyExpenses,
    categoryBreakdown,
    dailyExpenses,
    prevYearMonthlyExpenses,
  ] = await Promise.all([
    getMonthlyTransactionStats(currentYear, currentMonth),
    getMonthlyExpenses(currentYear),
    getCategoryBreakdown(currentYear, currentMonth),
    getDailyExpenses(currentYear, currentMonth),
    currentMonth < 6
      ? getMonthlyExpenses(currentYear - 1)
      : Promise.resolve([]),
  ]);

  let combinedMonthly: { month: number; total: number; year: number }[] = [];
  if (currentMonth < 6) {
    combinedMonthly = [
      ...prevYearMonthlyExpenses.map((m) => ({ ...m, year: currentYear - 1 })),
      ...monthlyExpenses.map((m) => ({ ...m, year: currentYear })),
    ];
  } else {
    combinedMonthly = monthlyExpenses.map((m) => ({ ...m, year: currentYear }));
  }

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = now.subtract(i, "month");
    last6Months.push({
      year: d.year(),
      month: d.month() + 1,
      label: `${d.month() + 1}월`,
    });
  }

  const monthlyChartData = last6Months.map((m) => {
    const found = combinedMonthly.find(
      (item) => item.month === m.month && item.year === m.year
    );
    return found ? found.total : 0;
  });

  const monthlyChartCategories = last6Months.map((m) => m.label);

  const topCategories = categoryBreakdown.slice(0, 5);
  const categorySeries = topCategories.map((c) => c.total);
  const categoryLabels = topCategories.map((c) => c.category || "미분류");

  const dailyChartCategories = Array.from(
    { length: daysInMonth },
    (_, i) => `${i + 1}일`
  );
  const dailyChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const found = dailyExpenses.find((d) => d.day === day);
    return found ? found.total : 0;
  });

  const totalExpense = monthlyStats.total_expense;
  const transactionCount = monthlyStats.transaction_count;
  const dailyAverage =
    now.date() > 0 ? Math.round(totalExpense / now.date()) : 0;
  const topCategoryName =
    categoryBreakdown.length > 0
      ? categoryBreakdown[0].category || "미분류"
      : "-";

  const hasData = transactionCount > 0 || monthlyExpenses.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <Card
          title="이번 달 총 지출"
          value={`${totalExpense.toLocaleString("ko-KR")}원`}
          icon={
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.29 0 2.13-.81 2.13-1.88 0-2.69-3.77-2.79-3.77-5.32 0-1.28.96-2.28 2.42-2.54V5h2.67v1.95c1.47.34 2.65 1.34 2.87 3.06h-1.99c-.11-.84-.96-1.52-2.12-1.52-1.32 0-1.92.83-1.92 1.76 0 2.8 3.77 2.69 3.77 5.4 0 1.43-1.15 2.37-2.58 2.54z"
                fill=""
              />
            </svg>
          }
        />
        <Card
          title="이번 달 거래 건수"
          value={`${transactionCount}건`}
          icon={
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                fill=""
              />
            </svg>
          }
        />
        <Card
          title="일평균 지출"
          value={`${dailyAverage.toLocaleString("ko-KR")}원`}
          icon={
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                fill=""
              />
            </svg>
          }
        />
        <Card
          title="가장 많은 카테고리"
          value={topCategoryName}
          icon={
            <svg
              className="fill-primary dark:fill-white"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="" />
            </svg>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {!hasData ? (
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 py-10 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-xl font-medium text-black dark:text-white">
              아직 거래 데이터가 없습니다.
            </h3>
            <p className="mt-2 text-body">
              Discord 봇으로 영수증을 업로드해보세요.
            </p>
          </div>
        ) : (
          <>
            <MonthlyExpenseChart
              series={[{ name: "지출", data: monthlyChartData }]}
              categories={monthlyChartCategories}
            />
            <CategoryDonutChart
              series={categorySeries}
              labels={categoryLabels}
            />
            <DailyExpenseChart
              series={[{ name: "지출", data: dailyChartData }]}
              categories={dailyChartCategories}
            />
          </>
        )}
      </div>
    </>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {icon}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
}
