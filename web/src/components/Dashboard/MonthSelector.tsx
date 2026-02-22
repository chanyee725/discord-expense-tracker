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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 h-full flex flex-col justify-center">
      <h4 className="mb-4 text-sm font-medium text-gray-500">기간 설정</h4>
      <div className="flex flex-col gap-3">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
        
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
