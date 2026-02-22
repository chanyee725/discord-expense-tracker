"use server";

import { revalidatePath } from "next/cache";
import { 
  getRecurringTransactions, 
  createRecurringTransaction, 
  updateRecurringTransaction, 
  deleteRecurringTransaction,
  getCategoriesByType,
  getBankAccounts
} from "@/lib/queries";

export async function getRecurringTransactionsAction(type: 'expense' | 'income') {
  try {
    const items = await getRecurringTransactions(type);
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    return { success: false, error: "Failed to fetch recurring transactions" };
  }
}

export async function saveRecurringTransactionAction(data: any) {
  try {
    if (data.id) {
      const result = await updateRecurringTransaction(data.id, {
        title: data.name,
        amount: data.amount,
        category: data.category || '',
        bank_account: data.bank_account || '',
        day_of_month: data.day_of_month
      });
      revalidatePath('/recurring-management');
      return { success: true, data: result };
    } else {
      const result = await createRecurringTransaction({
        title: data.name,
        type: data.type,
        amount: data.amount,
        category: data.category || '',
        bank_account: data.bank_account || '',
        day_of_month: data.day_of_month
      });
      revalidatePath('/recurring-management');
      return { success: true, data: result };
    }
  } catch (error) {
    console.error("Error saving recurring transaction:", error);
    return { success: false, error: "Failed to save recurring transaction" };
  }
}

export async function deleteRecurringTransactionAction(id: string) {
  try {
    await deleteRecurringTransaction(id);
    revalidatePath('/recurring-management');
    return { success: true };
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return { success: false, error: "Failed to delete recurring transaction" };
  }
}

export async function getCategoriesForRecurringAction(type: 'expense' | 'income') {
  try {
    const categories = await getCategoriesByType(type);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getBankAccountsForDropdownAction() {
  try {
    const accounts = await getBankAccounts();
    return { success: true, data: accounts };
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return { success: false, error: "Failed to fetch bank accounts" };
  }
}
