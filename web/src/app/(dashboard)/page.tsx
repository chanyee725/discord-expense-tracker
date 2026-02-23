import React from "react";
import {
  getMonthlyExpenses,
  getMonthlyIncome,
  getCategoryBreakdown,
  getDailyExpenses,
  getDailyIncome,
  getMonthlyTransactionStats,
  getAppSetting,
  getRecurringDueInRange,
} from "@/lib/queries";
import MonthlyExpenseChart from "@/components/Charts/MonthlyExpenseChart";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import DailyExpenseChart from "@/components/Charts/DailyExpenseChart";
import MonthlyExpenseCard from "@/components/Dashboard/MonthlyExpenseCard";
import MonthSelector from "@/components/Dashboard/MonthSelector";
import UpcomingPaymentsCard from "@/components/Dashboard/UpcomingPaymentsCard";
import RecurringCheckTrigger from "@/components/RecurringCheckTrigger";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ selectedYear?: string; selectedMonth?: string }>;
}) {
  const params = await searchParams;
  const now = dayjs();
  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const selectedYear = params.selectedYear
    ? Number(params.selectedYear)
    : currentYear;
  const selectedMonth = params.selectedMonth
    ? Number(params.selectedMonth)
    : currentMonth;

  const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
  const daysInSelectedMonth = selectedDate.daysInMonth();

  const [
    monthlyStats,
    monthlyExpenses,
    monthlyIncome,
    categoryBreakdown,
    dailyExpenses,
    dailyIncome,
    prevYearMonthlyExpenses,
    prevYearMonthlyIncome,
    upcomingPayments,
  ] = await Promise.all([
    getMonthlyTransactionStats(selectedYear, selectedMonth),
    getMonthlyExpenses(currentYear),
    getMonthlyIncome(currentYear),
    getCategoryBreakdown(selectedYear, selectedMonth),
    getDailyExpenses(selectedYear, selectedMonth),
    getDailyIncome(selectedYear, selectedMonth),
    currentMonth < 6
      ? getMonthlyExpenses(currentYear - 1)
      : Promise.resolve([]),
    currentMonth < 6
      ? getMonthlyIncome(currentYear - 1)
      : Promise.resolve([]),
    (async () => {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return getRecurringDueInRange(today, nextWeek);
    })(),
  ]);

  const monthlyBudgetStr = await getAppSetting('monthly_budget');
  const monthlyBudget = monthlyBudgetStr ? parseInt(monthlyBudgetStr) : null;

  let combinedMonthly: { month: number; total: number; year: number }[] = [];
  let combinedMonthlyIncome: { month: number; total: number; year: number }[] = [];
  if (currentMonth < 6) {
    combinedMonthly = [
      ...prevYearMonthlyExpenses.map((m) => ({ ...m, year: currentYear - 1 })),
      ...monthlyExpenses.map((m) => ({ ...m, year: currentYear })),
    ];
    combinedMonthlyIncome = [
      ...prevYearMonthlyIncome.map((m) => ({ ...m, year: currentYear - 1 })),
      ...monthlyIncome.map((m) => ({ ...m, year: currentYear })),
    ];
  } else {
    combinedMonthly = monthlyExpenses.map((m) => ({ ...m, year: currentYear }));
    combinedMonthlyIncome = monthlyIncome.map((m) => ({ ...m, year: currentYear }));
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

  const monthlyChartIncomeData = last6Months.map((m) => {
    const found = combinedMonthlyIncome.find(
      (item) => item.month === m.month && item.year === m.year
    );
    return found ? found.total : 0;
  });

  const monthlyChartCategories = last6Months.map((m) => m.label);

  const topCategories = categoryBreakdown.slice(0, 5);
  const categorySeries = topCategories.map((c) => c.total);
  const categoryLabels = topCategories.map((c) => c.category || "미분류");

  const dailyChartCategories = Array.from(
    { length: daysInSelectedMonth },
    (_, i) => `${i + 1}일`
  );
  const dailyChartData = Array.from({ length: daysInSelectedMonth }, (_, i) => {
    const day = i + 1;
    const found = dailyExpenses.find((d) => d.day === day);
    return found ? found.total : 0;
  });

  const dailyIncomeChartData = Array.from({ length: daysInSelectedMonth }, (_, i) => {
    const day = i + 1;
    const found = dailyIncome.find((d) => d.day === day);
    return found ? found.total : 0;
  });

  const totalExpense = monthlyStats.total_expense;
  const transactionCount = monthlyStats.transaction_count;
  const isCurrentMonth =
    selectedYear === currentYear && selectedMonth === currentMonth;
  const divider = isCurrentMonth ? now.date() : daysInSelectedMonth;

  const hasData = transactionCount > 0 || monthlyExpenses.length > 0;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <RecurringCheckTrigger />
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MonthlyExpenseCard totalExpense={totalExpense} budgetGoal={monthlyBudget} />
        <Card
          title="이번 달 거래 건수"
          value={`${transactionCount}건`}
          icon={
            <svg
              className="fill-current"
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
        <UpcomingPaymentsCard payments={upcomingPayments} />
        <MonthSelector />
      </div>

      {!hasData ? (
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center">
          <h3 className="text-2xl font-medium text-gray-800">
            아직 거래 데이터가 없습니다.
          </h3>
          <p className="mt-2 text-gray-500">
            Discord 봇으로 영수증을 업로드해보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="col-span-12">
            <DailyExpenseChart
              series={[
                { name: "지출", data: dailyChartData },
                { name: "수입", data: dailyIncomeChartData },
              ]}
              categories={dailyChartCategories}
              title={`일별 수입/지출 (${selectedYear}년 ${selectedMonth}월)`}
            />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <CategoryDonutChart
              series={categorySeries}
              labels={categoryLabels}
            />
          </div>
          <div className="col-span-12 xl:col-span-7">
            <MonthlyExpenseChart
              series={[
                { name: "지출", data: monthlyChartData },
                { name: "수입", data: monthlyChartIncomeData },
              ]}
              categories={monthlyChartCategories}
            />
          </div>
        </>
      )}
    </div>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500">{title}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl">
            {value}
          </h4>
        </div>
      </div>
    </div>
  );
}
