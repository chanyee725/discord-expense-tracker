"use server";

import { revalidatePath } from "next/cache";
import { updateTransaction, deleteTransaction, createTransaction } from "@/lib/queries";
import { Transaction } from "@/types/transaction";

export async function createTransactionAction(data: {
  title: string;
  amount: number;
  type: "수입" | "지출";
  category?: string;
  transaction_date: string;
  withdrawal_source?: string;
  deposit_destination?: string;
}) {
  try {
    const result = await createTransaction(data);
    if (!result) {
      return { success: false, error: "Failed to create transaction" };
    }
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function updateTransactionAction(
  id: string,
  data: Partial<Pick<Transaction, 'title' | 'amount' | 'type' | 'category' | 'transaction_date' | 'raw_ocr_text' | 'withdrawal_source' | 'deposit_destination'>>
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
