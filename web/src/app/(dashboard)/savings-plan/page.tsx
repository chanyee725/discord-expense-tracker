import { getMonthlyTransactionStats } from "@/lib/queries";
import SavingsPlanClient from "./client";

export const dynamic = "force-dynamic";

export default async function SavingsPlanPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const stats = await getMonthlyTransactionStats(year, month);
  
  return <SavingsPlanClient initialSpending={stats.total_expense} />;
}
