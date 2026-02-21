/**
 * Transaction type definition matching the PostgreSQL schema
 * Defines the structure of transaction records from the database
 */

export interface Transaction {
  id: string; // UUID primary key
  title: string | null;
  amount: number; // INTEGER in database
  category: string | null;
  deposit_destination: string | null;
  withdrawal_source: string | null;
  transaction_date: string | null; // TEXT - Korean freeform date (unreliable for parsing)
  raw_ocr_text: string | null;
  created_at: Date; // TIMESTAMP - reliable for date-based queries
}
