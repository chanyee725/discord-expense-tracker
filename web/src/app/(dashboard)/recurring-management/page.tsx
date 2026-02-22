import React from "react";
import { getRecurringTransactions } from "@/lib/queries";
import RecurringManagementClient from "./RecurringManagementClient";

export const dynamic = "force-dynamic";

export default async function RecurringManagementPage() {
  const [expenses, income] = await Promise.all([
    getRecurringTransactions("expense"),
    getRecurringTransactions("income"),
  ]);

  return (
    <RecurringManagementClient
      initialExpenses={expenses}
      initialIncome={income}
    />
  );
}
