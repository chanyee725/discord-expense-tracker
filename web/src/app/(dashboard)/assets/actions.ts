"use server";

import { getMonthlyAssetGrowth } from "@/lib/queries";

export async function fetchMonthlyAssetGrowth(year: number) {
  try {
    const data = await getMonthlyAssetGrowth(year);
    return data;
  } catch (error) {
    console.error("Error fetching monthly asset growth:", error);
    return [];
  }
}

