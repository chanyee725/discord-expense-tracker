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
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm h-full flex flex-col justify-center">
      {/* Header with Icon */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-base font-semibold text-gray-800 tracking-tight">조회 기간</h4>
      </div>
      
      <div className="space-y-4">
        {/* Year Selector */}
        <div>
          <label htmlFor="year-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5">
            년도
          </label>
          <div className="relative">
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Month Selector */}
        <div>
          <label htmlFor="month-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5">
            월
          </label>
          <div className="relative">
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
