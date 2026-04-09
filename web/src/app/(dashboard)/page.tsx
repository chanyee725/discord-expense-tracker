import React from "react";
import {
  getMonthlyExpenses,
  getMonthlyIncome,
  getMonthlySummary,
  getCategoryBreakdown,
  getDailyExpenses,
  getDailyIncome,
  getMonthlyTransactionStats,
  getAppSetting,
  getRecurringDueInRange,
  getTransactionsByMonth,
  getBankAccounts,
} from "@/lib/queries";
import { isSelfTransfer } from "@/lib/transfer-utils";
import MonthlyExpenseChart from "@/components/Charts/MonthlyExpenseChart";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import DailyExpenseChart from "@/components/Charts/DailyExpenseChart";
import MonthlySummaryTable from "@/components/Tables/MonthlySummaryTable";
import MonthlyExpenseCard from "@/components/Dashboard/MonthlyExpenseCard";
import MonthSelector from "@/components/Dashboard/MonthSelector";
import UpcomingPaymentsCard from "@/components/Dashboard/UpcomingPaymentsCard";
import RecurringCheckTrigger from "@/components/RecurringCheckTrigger";
import { FileText, AlertCircle } from "lucide-react";
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
    bankAccounts,
    selectedMonthTransactions,
    monthlySummary,
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
    currentMonth < 6 ? getMonthlyIncome(currentYear - 1) : Promise.resolve([]),
    (async () => {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return getRecurringDueInRange(today, nextWeek);
    })(),
    getBankAccounts(),
    getTransactionsByMonth(selectedYear, selectedMonth),
    getMonthlySummary(),
  ]);

  const monthlyBudgetStr = await getAppSetting("monthly_budget");
  const monthlyBudget = monthlyBudgetStr ? parseInt(monthlyBudgetStr) : null;

  // Calculate self-transfer amounts per day to subtract from income
  const selfTransferByDay: Record<number, number> = {};
  for (const transaction of selectedMonthTransactions) {
    if (isSelfTransfer(transaction, bankAccounts)) {
      const day = new Date(transaction.created_at).getDate();
      selfTransferByDay[day] =
        (selfTransferByDay[day] || 0) + transaction.amount;
    }
  }

  let combinedMonthly: { month: number; total: number; year: number }[] = [];
  let combinedMonthlyIncome: { month: number; total: number; year: number }[] =
    [];
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
    combinedMonthlyIncome = monthlyIncome.map((m) => ({
      ...m,
      year: currentYear,
    }));
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
      (item) => item.month === m.month && item.year === m.year,
    );
    return found ? found.total : 0;
  });

  const monthlyChartIncomeData = last6Months.map((m) => {
    const found = combinedMonthlyIncome.find(
      (item) => item.month === m.month && item.year === m.year,
    );
    return found ? found.total : 0;
  });

  const monthlyChartCategories = last6Months.map((m) => m.label);

  const topCategories = categoryBreakdown.slice(0, 5);
  const categorySeries = topCategories.map((c) => c.total);
  const categoryLabels = topCategories.map((c) => c.category || "미분류");

  const dailyChartCategories = Array.from(
    { length: daysInSelectedMonth },
    (_, i) => `${i + 1}일`,
  );
  const dailyChartData = Array.from({ length: daysInSelectedMonth }, (_, i) => {
    const day = i + 1;
    const found = dailyExpenses.find((d) => d.day === day);
    return found ? found.total : 0;
  });

  const dailyIncomeChartData = Array.from(
    { length: daysInSelectedMonth },
    (_, i) => {
      const day = i + 1;
      const found = dailyIncome.find((d) => d.day === day);
      const selfTransferAmount = selfTransferByDay[day] || 0;
      return Math.max(0, (found ? found.total : 0) - selfTransferAmount);
    },
  );

  const totalExpense = monthlyStats.total_expense;
  const transactionCount = monthlyStats.transaction_count;
  const isCurrentMonth =
    selectedYear === currentYear && selectedMonth === currentMonth;
  const divider = isCurrentMonth ? now.date() : daysInSelectedMonth;

  const hasData = transactionCount > 0 || monthlyExpenses.length > 0;

  return (
    <div data-slot="dashboard-page" className="grid grid-cols-12 gap-6">
      <RecurringCheckTrigger />
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MonthlyExpenseCard
          totalExpense={totalExpense}
          budgetGoal={monthlyBudget}
        />
        <Card
          title="이번 달 거래 건수"
          value={`${transactionCount}건`}
          icon={<FileText className="size-4 text-text-primary" strokeWidth={2} />}
        />
        <UpcomingPaymentsCard payments={upcomingPayments} />
        <MonthSelector />
      </div>

      {!hasData ? (
        <div className="col-span-12 rounded-2xl bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-3 size-8 rounded-xl bg-surface-muted flex items-center justify-center">
            <AlertCircle className="size-4 text-text-tertiary" strokeWidth={1.5} />
          </div>
          <h3 className="text-[16px] font-bold text-text-primary tracking-[-0.01em] mb-1.5">
            아직 거래 데이터가 없습니다
          </h3>
          <p className="text-[14px] leading-normal text-text-secondary">
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
          <div className="col-span-12">
            <MonthlySummaryTable data={monthlySummary} />
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
    <div data-slot="stat-card" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-center size-7 rounded-lg bg-surface-muted">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-[12px] text-text-secondary font-medium">{title}</span>
          <h4 className="mt-2 font-bold text-2xl text-text-primary">{value}</h4>
        </div>
      </div>
    </div>
  );
}
