"use server";
import { getTransactionsByCategory } from "@/lib/queries";

export async function fetchTransactionsByCategoryAction(
  year: number,
  month: number,
  category: string
) {
  try {
    const transactions = await getTransactionsByCategory(year, month, category);
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, data: [] };
  }
}
