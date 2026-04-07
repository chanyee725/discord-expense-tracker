"use server";

import { revalidatePath } from "next/cache";
import { getAppSetting, setAppSetting } from "@/lib/queries";

export async function getMonthlyBudgetAction() {
  const value = await getAppSetting('monthly_budget');
  return { success: true, data: value || '2000000' };
}

export async function saveMonthlyBudgetAction(budget: string) {
  await setAppSetting('monthly_budget', budget);
  revalidatePath('/');
  return { success: true };
}
