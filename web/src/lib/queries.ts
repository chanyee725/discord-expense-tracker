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
 * Bank account record from bank_accounts table
 */
export interface BankAccountRow {
  id: string;
  bank_name: string;
  name: string;
  balance: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Category record from categories table
 */
export interface CategoryRow {
  id: string;
  name: string;
  type: string;  // 'expense' | 'income' | 'both'
  sort_order: number;
  created_at: string;
}

/**
 * Recurring transaction template from recurring_transactions table
 */
export interface RecurringTransactionRow {
  id: string;
  type: string;  // 'expense' | 'income'
  day_of_month: number;
  title: string;
  amount: number;
  category: string;
  bank_account: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Recurring transaction generation log from recurring_transaction_log table
 */
export interface RecurringTransactionLog {
  id: string;
  recurring_transaction_id: string;
  year: number;
  month: number;
  transaction_id: string | null;
  generated_at: string;
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
      type,
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
        AND type = '지출'
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
      AND type = '지출'
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
  return sql<Array<{ month: number; total: number }>>`
    SELECT
      EXTRACT(MONTH FROM created_at)::int as month,
      SUM(amount)::int as total
    FROM transactions
    WHERE EXTRACT(YEAR FROM created_at) = ${year}
      AND type = '수입'
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
      AND type = '지출'
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
      AND type = '지출'
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
      type,
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
      type,
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
  // Get current year and month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Query historical data from account_balance_history
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

  // If querying current year, get real-time balance for current month
  if (year === currentYear) {
    const currentBalanceResult = await sql<Array<{ total: number }>>`
      SELECT COALESCE(SUM(balance), 0)::int as total
      FROM bank_accounts
    `;
    
    const currentTotal = currentBalanceResult[0]?.total ?? 0;
    monthMap.set(currentMonth, currentTotal);
  }

  // Build full year array
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
 * Automatically updates bank_accounts.balance if amount changes
 */
export async function updateTransaction(
  id: string,
  data: Partial<Pick<Transaction, 'title' | 'amount' | 'category' | 'transaction_date' | 'raw_ocr_text'>>
): Promise<Transaction | null> {
  const { title, amount, category, transaction_date, raw_ocr_text } = data;

  const oldTx = await sql<[Transaction | undefined]>`
    SELECT * FROM transactions WHERE id = ${id}
  `.then(rows => rows[0]);
  
  if (!oldTx) return null;

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
      id, title, amount, type, category, deposit_destination, withdrawal_source, transaction_date, raw_ocr_text, created_at
  `;

  const updated = result[0];
  if (!updated) return null;

  if (amount !== undefined && amount !== oldTx.amount) {
    const amountDiff = amount - oldTx.amount;
    
    if (updated.type === '지출' && updated.withdrawal_source) {
      await sql`
        UPDATE bank_accounts 
        SET balance = balance - ${amountDiff}, updated_at = now() 
        WHERE name = ${updated.withdrawal_source}
      `;
    }
    
    if (updated.type === '수입' && updated.deposit_destination) {
      await sql`
        UPDATE bank_accounts 
        SET balance = balance + ${amountDiff}, updated_at = now() 
        WHERE name = ${updated.deposit_destination}
      `;
    }
  }

  return updated;
}

/**
 * Delete a transaction by ID
 * Returns the deleted transaction record
 * Automatically reverses bank_accounts.balance changes
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
      type,
      category,
      deposit_destination,
      withdrawal_source,
      transaction_date,
      raw_ocr_text,
      created_at
  `;

  const deleted = result[0];
  if (!deleted) return null;

  if (deleted.type === '지출' && deleted.withdrawal_source) {
    await sql`
      UPDATE bank_accounts 
      SET balance = balance + ${deleted.amount}, updated_at = now() 
      WHERE name = ${deleted.withdrawal_source}
    `;
  }
  
  if (deleted.type === '수입' && deleted.deposit_destination) {
    await sql`
      UPDATE bank_accounts 
      SET balance = balance - ${deleted.amount}, updated_at = now() 
      WHERE name = ${deleted.deposit_destination}
    `;
  }

  return deleted;
}

/**
 * Get transactions for a specific category and month
 * Uses created_at for reliable date filtering
 */
export async function getTransactionsByCategory(
  year: number,
  month: number,
  category: string
): Promise<Transaction[]> {
  return sql<Transaction[]>`
    SELECT
      id, title, amount, category, deposit_destination, withdrawal_source,
      transaction_date, raw_ocr_text, created_at
    FROM transactions
    WHERE
      EXTRACT(YEAR FROM created_at) = ${year}
      AND EXTRACT(MONTH FROM created_at) = ${month}
      AND category = ${category}
    ORDER BY created_at DESC
  `;
}

// ============================================
// App Settings
// ============================================

/**
 * Get app setting value by key
 * Returns null if key doesn't exist
 */
export async function getAppSetting(key: string): Promise<string | null> {
  const result = await sql<[{ value: string } | undefined]>`
    SELECT value
    FROM app_settings
    WHERE key = ${key}
  `;
  
  return result[0]?.value ?? null;
}

/**
 * Set or update an app setting value
 * Uses upsert pattern (INSERT ... ON CONFLICT DO UPDATE)
 */
export async function setAppSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (${key}, ${value}, now())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = now()
  `;
}

// ============================================
// Bank Accounts
// ============================================

/**
 * Get all bank accounts ordered by sort_order
 */
export async function getBankAccounts(): Promise<BankAccountRow[]> {
  return sql<BankAccountRow[]>`
    SELECT * FROM bank_accounts
    ORDER BY sort_order ASC, created_at ASC
  `;
}

/**
 * Create a new bank account
 */
export async function createBankAccount(data: {
  bank_name: string;
  name: string;
  balance: number;
  sort_order?: number;
}): Promise<BankAccountRow> {
  const result = await sql<BankAccountRow[]>`
    INSERT INTO bank_accounts (bank_name, name, balance, sort_order, updated_at)
    VALUES (${data.bank_name}, ${data.name}, ${data.balance}, ${data.sort_order ?? 0}, now())
    RETURNING *
  `;
  return result[0];
}

/**
 * Update a bank account with partial data
 */
export async function updateBankAccount(
  id: string,
  data: Partial<{ bank_name: string; name: string; balance: number; sort_order: number }>
): Promise<BankAccountRow | null> {
  const updates = { ...data, updated_at: new Date().toISOString() };
  const result = await sql<BankAccountRow[]>`
    UPDATE bank_accounts
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

// ============================================
// Categories
// ============================================

/**
 * Get categories, optionally filtered by type
 * If type is provided, returns categories where type matches OR type='both'
 */
export async function getCategories(type?: 'expense' | 'income'): Promise<CategoryRow[]> {
  if (type) {
    return sql<CategoryRow[]>`
      SELECT * FROM categories
      WHERE type = ${type} OR type = 'both'
      ORDER BY sort_order ASC
    `;
  }
  
  return sql<CategoryRow[]>`
    SELECT * FROM categories
    ORDER BY sort_order ASC
  `;
}

/**
 * Get categories by type (convenience wrapper)
 */
export async function getCategoriesByType(type: 'expense' | 'income'): Promise<CategoryRow[]> {
  return getCategories(type);
}

// ============================================
// Recurring Transactions
// ============================================

/**
 * Get recurring transactions, optionally filtered by type
 */
export async function getRecurringTransactions(type?: 'expense' | 'income'): Promise<RecurringTransactionRow[]> {
  if (type) {
    return sql<RecurringTransactionRow[]>`
      SELECT * FROM recurring_transactions
      WHERE type = ${type}
      ORDER BY day_of_month ASC
    `;
  }
  
  return sql<RecurringTransactionRow[]>`
    SELECT * FROM recurring_transactions
    ORDER BY day_of_month ASC
  `;
}

/**
 * Create a new recurring transaction
 */
export async function createRecurringTransaction(data: {
  type: 'expense' | 'income';
  day_of_month: number;
  title: string;
  amount: number;
  category?: string | null;
  bank_account?: string | null;
}): Promise<RecurringTransactionRow> {
  const result = await sql<RecurringTransactionRow[]>`
    INSERT INTO recurring_transactions (type, day_of_month, title, amount, category, bank_account, is_active, created_at, updated_at)
    VALUES (${data.type}, ${data.day_of_month}, ${data.title}, ${data.amount}, ${data.category ?? ''}, ${data.bank_account ?? ''}, true, now(), now())
    RETURNING *
  `;
  return result[0];
}

/**
 * Update a recurring transaction with partial data
 */
export async function updateRecurringTransaction(
  id: string,
  data: Partial<{ type: string; day_of_month: number; title: string; amount: number; category: string | null; bank_account: string | null }>
): Promise<RecurringTransactionRow | null> {
  const updates = { ...data, updated_at: new Date().toISOString() };
  const result = await sql<RecurringTransactionRow[]>`
    UPDATE recurring_transactions
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurringTransaction(id: string): Promise<RecurringTransactionRow | null> {
  const result = await sql<RecurringTransactionRow[]>`
    DELETE FROM recurring_transactions
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string): Promise<BankAccountRow | null> {
  const result = await sql<BankAccountRow[]>`
    DELETE FROM bank_accounts
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

export function getNextBusinessDay(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(day, lastDay);
  
  const date = new Date(year, month - 1, clampedDay);
  
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 6) {
    date.setDate(date.getDate() + 2);
  } else if (dayOfWeek === 0) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

export async function generateRecurringTransactions(
  year: number, 
  month: number,
  day?: number // Optional: if provided, only generate for this specific day
): Promise<{ generated: number; skipped: number }> {
  
  const recurring = await sql<RecurringTransactionRow[]>`
    SELECT * FROM recurring_transactions 
    WHERE is_active = true
  `;
  
  const existingLogs = await sql<RecurringTransactionLog[]>`
    SELECT * FROM recurring_transaction_log
    WHERE year = ${year} AND month = ${month}
  `;
  
  const existingIds = new Set(existingLogs.map(log => log.recurring_transaction_id));
  
  // Filter by day if provided (for daily cron), otherwise generate all for the month (for catch-up)
  let toGenerate = recurring.filter(r => !existingIds.has(r.id));
  
  if (day !== undefined) {
    // Only generate templates whose day_of_month matches today's date
    toGenerate = toGenerate.filter(r => r.day_of_month === day);
  }
  
  let generated = 0;
  let skipped = 0;
  
  for (const template of toGenerate) {
    try {
      const businessDay = getNextBusinessDay(year, month, template.day_of_month);
      
      const transactionType = template.type === 'expense' ? '지출' : '수입';
      
      const withdrawalSource = template.type === 'expense' ? template.bank_account : null;
      const depositDestination = template.type === 'income' ? template.bank_account : null;
      
      const koreanMonth = businessDay.getMonth() + 1;
      const koreanDay = businessDay.getDate();
      const transactionDate = `${koreanMonth}월 ${koreanDay}일`;
      
      await sql.begin(async (tx: any) => {
        // CRITICAL: Insert log FIRST to prevent race conditions
        // If duplicate exists, UNIQUE constraint will fail and entire transaction rolls back
        // This prevents creating duplicate transactions in the transactions table
        await tx`
          INSERT INTO recurring_transaction_log (
            recurring_transaction_id, year, month, transaction_id, generated_at
          )
          VALUES (
            ${template.id}, ${year}, ${month}, ${null}, now()
          )
        `;
        
        const insertedRows = await tx`
          INSERT INTO transactions (
            title, amount, type, category, 
            deposit_destination, withdrawal_source, 
            transaction_date, raw_ocr_text, created_at
          )
          VALUES (
            ${template.title}, ${template.amount}, ${transactionType}, ${template.category},
            ${depositDestination}, ${withdrawalSource},
            ${transactionDate}, ${null}, ${businessDay}
          )
          RETURNING *
        `;
        const inserted = insertedRows[0] as Transaction;
        
        // Update the log with the actual transaction_id
        await tx`
          UPDATE recurring_transaction_log
          SET transaction_id = ${inserted.id}
          WHERE recurring_transaction_id = ${template.id}
            AND year = ${year}
            AND month = ${month}
        `;
        
        if (transactionType === '지출' && withdrawalSource) {
          await tx`
            UPDATE bank_accounts 
            SET balance = balance - ${template.amount}, updated_at = now()
            WHERE name = ${withdrawalSource}
          `;
        }
        
        if (transactionType === '수입' && depositDestination) {
          await tx`
            UPDATE bank_accounts 
            SET balance = balance + ${template.amount}, updated_at = now()
            WHERE name = ${depositDestination}
          `;
        }
      });
      
      generated++;
      
    } catch (error: any) {
      if (error?.code === '23505') {
        skipped++;
      } else {
        console.error(`Failed to generate recurring transaction ${template.id}:`, error);
        throw error;
      }
    }
  }
  
  return { generated, skipped };
}
