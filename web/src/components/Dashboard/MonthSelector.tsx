"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";
import dayjs from "dayjs";

export default function MonthSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const now = dayjs();
  
  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const selectedYear = Number(searchParams.get("selectedYear")) || currentYear;
  const selectedMonth = Number(searchParams.get("selectedMonth")) || currentMonth;

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedYear", newYear);
    // Ensure month is preserved or reset if invalid for new year (though for expenses all months valid)
    if (!searchParams.get("selectedMonth")) {
        params.set("selectedMonth", selectedMonth.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (!searchParams.get("selectedYear")) {
        params.set("selectedYear", selectedYear.toString());
    }
    params.set("selectedMonth", newMonth);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate year options: current year ± 2
  const yearOptions = [];
  for (let i = -2; i <= 2; i++) {
    yearOptions.push(currentYear + i);
  }

  // Generate month options: 1-12
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div data-slot="month-selector" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] h-full flex flex-col justify-center">
      {/* Header with Icon */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center justify-center size-7 rounded-lg bg-brand/10">
          <svg className="size-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-[12px] text-text-secondary font-medium uppercase tracking-[0.05em]">조회 기간</h4>
      </div>
      
      <div className="flex flex-row gap-3">
        {/* Year Selector */}
        <div className="flex-1">
          <label htmlFor="year-select" className="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 ms-0.5">
            년도
          </label>
          <div className="relative">
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text-primary shadow-xs transition-all duration-200 hover:border-brand/40 focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-text-tertiary">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Month Selector */}
        <div className="flex-1">
          <label htmlFor="month-select" className="block text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 ms-0.5">
            월
          </label>
          <div className="relative">
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text-primary shadow-xs transition-all duration-200 hover:border-brand/40 focus:border-brand focus:outline-hidden focus:ring-2 focus:ring-brand/20"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-3 text-text-tertiary">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
