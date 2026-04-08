"use client";

import React, { useState } from "react";
import CategoryDonutChart from "@/components/Charts/CategoryDonutChart";
import CategoryDetailList from "@/components/Dashboard/CategoryDetailList";

interface CategoryExpensesClientProps {
  categorySeries: number[];
  categoryLabels: string[];
  centerLabel: string;
  categoryBreakdown: Array<{ category: string | null; total: number }>;
  totalExpense: number;
  selectedYear: number;
  selectedMonth: number;
}

export default function CategoryExpensesClient({
  categorySeries,
  categoryLabels,
  centerLabel,
  categoryBreakdown,
  totalExpense,
  selectedYear,
  selectedMonth,
}: CategoryExpensesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryLabel: string | null) => {
    if (!categoryLabel) {
      setSelectedCategory(null);
      return;
    }
    if (selectedCategory === categoryLabel) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryLabel);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <CategoryDonutChart
          series={categorySeries}
          labels={categoryLabels}
          centerLabel={centerLabel}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <h3 className="mb-6 text-xl font-semibold text-gray-800">
          {selectedCategory ? `${selectedCategory} 상세 내역` : "카테고리별 상세"}
        </h3>
        
        <CategoryDetailList 
          categoryBreakdown={categoryBreakdown}
          totalExpense={totalExpense}
          year={selectedYear}
          month={selectedMonth}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryClick}
        />
      </div>
    </div>
  );
}
