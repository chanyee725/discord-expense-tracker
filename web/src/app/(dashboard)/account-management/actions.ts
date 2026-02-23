"use server";

import { revalidatePath } from "next/cache";
import { 
  getBankAccounts, 
  createBankAccount, 
  updateBankAccount, 
  deleteBankAccount,
  BankAccountRow
} from "@/lib/queries";

export async function getBankAccountsAction() {
  const accounts = await getBankAccounts();
  return { success: true, data: accounts };
}

export async function saveBankAccountAction(data: { 
  id?: string; 
  bank_name: string; 
  account_name: string; 
  balance: number;
  sort_order?: number;
}) {
  try {
    if (data.id) {
      const result = await updateBankAccount(data.id, { 
        bank_name: data.bank_name, 
        name: data.account_name, 
        balance: data.balance,
        sort_order: data.sort_order ?? 0
      });
      revalidatePath('/account-management');
      return { success: true, data: result };
    } else {
      const result = await createBankAccount({ 
        bank_name: data.bank_name, 
        name: data.account_name, 
        balance: data.balance,
        sort_order: data.sort_order
      });
      revalidatePath('/account-management');
      return { success: true, data: result };
    }
  } catch (error) {
    console.error("Error saving bank account:", error);
    return { success: false, error: "Failed to save bank account" };
  }
}

export async function deleteBankAccountAction(id: string) {
  try {
    await deleteBankAccount(id);
    revalidatePath('/account-management');
    return { success: true };
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return { success: false, error: "Failed to delete bank account" };
  }
}
