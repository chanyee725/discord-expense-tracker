/**
 * Reusable query functions for transaction data
 *
 * All date-based queries use created_at TIMESTAMP, not transaction_date (which is unreliable TEXT)
 * Uses postgres.js tagged template syntax for SQL injection prevention
 */

import sql from "./db";
import { Transaction } from "../types/transaction";

/**
 * Account balance history record from account_balance_history table
 */
export interface AccountBalanceHistory {
  id: string;
  account_id: string;
  account_name: string;
  bank_name: string;
  balance: number;
  snapshot_date: string; // ISO date string
  created_at: string; // ISO timestamp
}

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
      raw_ocr_text,
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
 * Get monthly income totals for a given year, grouped by month
 * Currently returns empty array as income tracking is not yet implemented
 * Uses created_at for reliable date filtering
 */
export async function getMonthlyIncome(
  year: number
): Promise<Array<{ month: number; total: number }>> {
  // Placeholder for future income tracking
  // When income transactions are supported, query here for positive amounts or specific category
  return [];
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
      raw_ocr_text,
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
      raw_ocr_text,
      created_at
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
    ORDER BY created_at ASC
  `;
}

/**
 * Insert a new account balance snapshot
 * Records the balance of a specific account at a point in time
 */
export async function insertAccountBalanceSnapshot(
  account_id: string,
  account_name: string,
  bank_name: string,
  balance: number,
  snapshot_date: string
): Promise<AccountBalanceHistory> {
  const result = await sql<[AccountBalanceHistory]>`
    INSERT INTO account_balance_history
      (account_id, account_name, bank_name, balance, snapshot_date)
    VALUES
      (${account_id}, ${account_name}, ${bank_name}, ${balance}, ${snapshot_date})
    RETURNING
      id,
      account_id,
      account_name,
      bank_name,
      balance,
      snapshot_date,
      created_at
  `;

  return result[0];
}

/**
 * Get account balance history for a specific account
 * Returns all snapshots ordered by most recent first
 */
export async function getAccountBalanceHistory(
  account_id: string,
  limit?: number
): Promise<AccountBalanceHistory[]> {
  if (limit === undefined) {
    return sql<AccountBalanceHistory[]>`
      SELECT
        id,
        account_id,
        account_name,
        bank_name,
        balance,
        snapshot_date,
        created_at
      FROM account_balance_history
      WHERE account_id = ${account_id}
      ORDER BY snapshot_date DESC
    `;
  }

  return sql<AccountBalanceHistory[]>`
    SELECT
      id,
      account_id,
      account_name,
      bank_name,
      balance,
      snapshot_date,
      created_at
    FROM account_balance_history
    WHERE account_id = ${account_id}
    ORDER BY snapshot_date DESC
    LIMIT ${limit}
  `;
}

/**
 * Get monthly asset growth for a given year
 * Sums all account balances per month across all accounts
 * Returns data for all 12 months (Jan-Dec), with 0 for months with no data
 */
export async function getMonthlyAssetGrowth(
  year: number
): Promise<Array<{ month: number; total_balance: number }>> {
  const result = await sql<
    Array<{ month: number; total_balance: number }>
  >`
    SELECT
      EXTRACT(MONTH FROM snapshot_date)::int as month,
      SUM(balance)::int as total_balance
    FROM account_balance_history
    WHERE EXTRACT(YEAR FROM snapshot_date) = ${year}
    GROUP BY month
    ORDER BY month ASC
  `;

  // Fill in missing months with 0
  const monthMap = new Map(result.map((row) => [row.month, row.total_balance]));
  const fullYear: Array<{ month: number; total_balance: number }> = [];

  for (let month = 1; month <= 12; month++) {
    fullYear.push({
      month,
      total_balance: monthMap.get(month) ?? 0,
    });
  }

  return fullYear;
}

/**
 * Update a transaction with partial data
 * Only updates the provided fields; missing fields are left unchanged
 * Returns the updated transaction record
 */
export async function updateTransaction(
  id: string,
  data: Partial<Pick<Transaction, 'title' | 'amount' | 'category' | 'transaction_date' | 'raw_ocr_text'>>
): Promise<Transaction | null> {
  const { title, amount, category, transaction_date, raw_ocr_text } = data;

  const result = await sql<[Transaction | undefined]>`
    UPDATE transactions
    SET
      title = ${title ?? sql`title`},
      amount = ${amount ?? sql`amount`},
      category = ${category ?? sql`category`},
      transaction_date = ${transaction_date ?? sql`transaction_date`},
      raw_ocr_text = ${raw_ocr_text ?? sql`raw_ocr_text`}
    WHERE id = ${id}
    RETURNING
      id, title, amount, category, deposit_destination, withdrawal_source, transaction_date, raw_ocr_text, created_at
  `;

  return result[0] ?? null;
}

/**
 * Delete a transaction by ID
 * Returns the deleted transaction record
 */
export async function deleteTransaction(
  id: string
): Promise<Transaction | null> {
  const result = await sql<[Transaction | undefined]>`
    DELETE FROM transactions
    WHERE id = ${id}
    RETURNING
      id,
      title,
      amount,
      category,
      deposit_destination,
      withdrawal_source,
      transaction_date,
      raw_ocr_text,
      created_at
  `;

  return result[0] ?? null;
}

