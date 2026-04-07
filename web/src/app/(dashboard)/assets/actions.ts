"use server";

import {
  getMonthlyAssetGrowth,
  getMonthlyAssetGrowthByAccount,
  getBankAccounts,
  getSavingsGoal,
  upsertSavingsGoal,
  deleteSavingsGoal,
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

export async function fetchMonthlyAssetGrowthByAccount(
  year: number,
  accountId: string | null,
) {
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

export async function fetchSavingsGoal(year: number) {
  try {
    const goal = await getSavingsGoal(year);
    return goal;
  } catch (error) {
    console.error("Error fetching savings goal:", error);
    return null;
  }
}

export async function saveSavingsGoal(year: number, goalAmount: number) {
  try {
    const goal = await upsertSavingsGoal(year, goalAmount);
    return { success: true, data: goal };
  } catch (error) {
    console.error("Error saving savings goal:", error);
    return { success: false, error: "Failed to save goal" };
  }
}

export async function removeSavingsGoal(year: number) {
  try {
    await deleteSavingsGoal(year);
    return { success: true };
  } catch (error) {
    console.error("Error removing savings goal:", error);
    return { success: false, error: "Failed to remove goal" };
  }
}
