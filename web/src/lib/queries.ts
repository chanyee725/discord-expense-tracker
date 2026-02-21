/**
 * Reusable query functions for transaction data
 *
 * All date-based queries use created_at TIMESTAMP, not transaction_date (which is unreliable TEXT)
 * Uses postgres.js tagged template syntax for SQL injection prevention
 */

import sql from "./db";
import { Transaction } from "../types/transaction";

/**
 * Get paginated list of transactions ordered by creation date (newest first)
 */
export async function getTransactions(
  page: number = 1,
  limit: number = 20
): Promise<Transaction[]> {
  const offset = (page - 1) * limit;

  return sql<Transaction[]>`
    SELECT
      id,
      title,
      amount,
      category,
      deposit_destination,
      withdrawal_source,
      transaction_date,
      created_at
    FROM transactions
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

/**
 * Get monthly transaction statistics (total expense and count)
 * Uses created_at for reliable date filtering
 */
export async function getMonthlyTransactionStats(
  year: number,
  month: number
): Promise<{ total_expense: number; transaction_count: number }> {
  const result = await sql<
    [{ total_expense: number | null; transaction_count: number }]
  >`
    SELECT
      SUM(amount)::int as total_expense,
      COUNT(*)::int as transaction_count
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
  `;

  return {
    total_expense: result[0]?.total_expense ?? 0,
    transaction_count: result[0]?.transaction_count ?? 0,
  };
}

/**
 * Get total count of transactions (for pagination metadata)
 */
export async function getTransactionCount(): Promise<number> {
  const result = await sql<[{ count: number }]>`
    SELECT COUNT(*) as count FROM transactions
  `;

  return result[0]?.count ?? 0;
}

/**
 * Get monthly expense totals for a given year, grouped by month
 * Uses created_at for reliable date filtering
 */
export async function getMonthlyExpenses(
  year: number
): Promise<Array<{ month: number; total: number }>> {
  return sql<Array<{ month: number; total: number }>>`
    SELECT
      EXTRACT(MONTH FROM created_at)::int as month,
      SUM(amount)::int as total
    FROM transactions
    WHERE EXTRACT(YEAR FROM created_at) = ${year}
    GROUP BY month
    ORDER BY month ASC
  `;
}

/**
 * Get expense breakdown by category for a given month
 * Uses created_at for reliable date filtering
 */
export async function getCategoryBreakdown(
  year: number,
  month: number
): Promise<Array<{ category: string | null; total: number }>> {
  return sql<Array<{ category: string | null; total: number }>>`
    SELECT
      category,
      SUM(amount)::int as total
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
    GROUP BY category
    ORDER BY total DESC
  `;
}

/**
 * Get daily expense totals for a given month
 * Uses created_at for reliable date filtering
 */
export async function getDailyExpenses(
  year: number,
  month: number
): Promise<Array<{ day: number; total: number }>> {
  return sql<Array<{ day: number; total: number }>>`
    SELECT
      EXTRACT(DAY FROM created_at)::int as day,
      SUM(amount)::int as total
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
    GROUP BY day
    ORDER BY day ASC
  `;
}

/**
 * Get most recent transactions
 * Uses created_at for reliable ordering
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<Transaction[]> {
  return sql<Transaction[]>`
    SELECT
      id,
      title,
      amount,
      category,
      deposit_destination,
      withdrawal_source,
      transaction_date,
      created_at
    FROM transactions
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

/**
 * Get all transactions for a specific month
 * Uses created_at for reliable date filtering
 */
export async function getTransactionsByMonth(
  year: number,
  month: number
): Promise<Transaction[]> {
  return sql<Transaction[]>`
    SELECT
      id,
      title,
      amount,
      category,
      deposit_destination,
      withdrawal_source,
      transaction_date,
      created_at
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
    ORDER BY created_at ASC
  `;
}
