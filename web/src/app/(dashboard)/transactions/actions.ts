"use server";

import { revalidatePath } from "next/cache";
import { updateTransaction, deleteTransaction } from "@/lib/queries";
import { Transaction } from "@/types/transaction";

export async function updateTransactionAction(
  id: string,
  data: Partial<Pick<Transaction, 'title' | 'amount' | 'category' | 'transaction_date' | 'raw_ocr_text'>>
) {
  try {
    const result = await updateTransaction(id, data);
    if (!result) {
      return { success: false, error: "Transaction not found" };
    }
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    const result = await deleteTransaction(id);
    if (!result) {
      return { success: false, error: "Transaction not found" };
    }
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}
