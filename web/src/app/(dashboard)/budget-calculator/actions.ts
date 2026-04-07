"use server";

import { getRecurringTransactions, getAppSetting, setAppSetting } from "@/lib/queries";

export async function fetchRecurringIncome() {
  try {
    const data = await getRecurringTransactions("income");
    return data;
  } catch (error) {
    console.error("Error fetching recurring income:", error);
    return [];
  }
}

export async function fetchRecurringExpenses() {
  try {
    const data = await getRecurringTransactions("expense");
    return data;
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return [];
  }
}

export interface BudgetSettings {
  monthlyIncome: number;
  savingsAmount: number;
  fixedAmount: number;
  variableAmount: number;
  emergencyAmount: number;
}

export async function saveBudgetSettings(settings: BudgetSettings) {
  try {
    await setAppSetting("budget_calculator", JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    console.error("Error saving budget settings:", error);
    return { success: false, error: String(error) };
  }
}

export async function loadBudgetSettings(): Promise<BudgetSettings | null> {
  try {
    const data = await getAppSetting("budget_calculator");
    if (!data) return null;
    return JSON.parse(data) as BudgetSettings;
  } catch (error) {
    console.error("Error loading budget settings:", error);
    return null;
  }
}
