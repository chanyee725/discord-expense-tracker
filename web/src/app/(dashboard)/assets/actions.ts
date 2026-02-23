"use server";

import { 
  getMonthlyAssetGrowth,
  getMonthlyAssetGrowthByAccount,
  getBankAccounts,
} from "@/lib/queries";

export async function fetchMonthlyAssetGrowth(year: number) {
  try {
    const data = await getMonthlyAssetGrowth(year);
    return data;
  } catch (error) {
    console.error("Error fetching monthly asset growth:", error);
    return [];
  }
}

export async function fetchMonthlyAssetGrowthByAccount(year: number, accountId: string | null) {
  try {
    const data = await getMonthlyAssetGrowthByAccount(year, accountId);
    return data;
  } catch (error) {
    console.error("Error fetching monthly asset growth by account:", error);
    return [];
  }
}

export async function fetchBankAccounts() {
  try {
    const data = await getBankAccounts();
    return data;
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return [];
  }
}
