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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
      <div className="flex flex-col">
        <CategoryDonutChart
          series={categorySeries}
          labels={categoryLabels}
          centerLabel={centerLabel}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      <div data-slot="section-card" className="flex flex-col rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="mb-6 text-[18px] font-bold leading-snug text-text-primary shrink-0">
          {selectedCategory ? `${selectedCategory} 상세 내역` : "카테고리별 상세"}
        </h3>
        
        <div className="flex-1 min-h-0">
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
    </div>
  );
}
