import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => {
  const mockFn = vi.fn();
  mockFn.mockImplementation((...args: any[]) => {
    if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
      return 'SQL_FRAGMENT';
    }
    return mockFn;
  });
  return {
    default: mockFn
  };
});

import sql from '@/lib/db';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction
} from '@/lib/queries';
import type { RecurringTransactionRow } from '@/lib/queries';

describe('Recurring Transaction Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sql as any).mockImplementation((...args: any[]) => {
      if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
        return 'SQL_FRAGMENT';
      }
      return sql;
    });
  });

  const mockExpenseTransaction: RecurringTransactionRow = {
    id: '1',
    type: 'expense',
    day_of_month: 5,
    title: '월세',
    amount: 500000,
    category: '주거비',
    bank_account: '국민은행',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockIncomeTransaction: RecurringTransactionRow = {
    id: '2',
    type: 'income',
    day_of_month: 25,
    title: '급여',
    amount: 3000000,
    category: '월급',
    bank_account: '카카오뱅크',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  };

  it('should get all recurring transactions without filter', async () => {
    const mockTransactions: RecurringTransactionRow[] = [
      mockExpenseTransaction,
      mockIncomeTransaction
    ];
    
    (sql as any).mockResolvedValueOnce(mockTransactions);
    
    const result = await getRecurringTransactions();
    expect(result).toEqual(mockTransactions);
    expect(result).toHaveLength(2);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should get expense recurring transactions', async () => {
    const mockExpenseTransactions: RecurringTransactionRow[] = [
      mockExpenseTransaction
    ];
    
    (sql as any).mockResolvedValueOnce(mockExpenseTransactions);
    
    const result = await getRecurringTransactions('expense');
    expect(result).toEqual(mockExpenseTransactions);
    expect(result).toHaveLength(1);
    expect(result.every(t => t.type === 'expense')).toBe(true);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should get income recurring transactions', async () => {
    const mockIncomeTransactions: RecurringTransactionRow[] = [
      mockIncomeTransaction
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeTransactions);
    
    const result = await getRecurringTransactions('income');
    expect(result).toEqual(mockIncomeTransactions);
    expect(result).toHaveLength(1);
    expect(result.every(t => t.type === 'income')).toBe(true);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return empty array when no transactions exist', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await getRecurringTransactions();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should create recurring transaction', async () => {
    const mockNewTransaction: RecurringTransactionRow = {
      id: '3',
      type: 'expense',
      day_of_month: 15,
      title: '구독료',
      amount: 10000,
      category: '여가',
      bank_account: '신한은행',
      is_active: true,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockNewTransaction]);
    
    const result = await createRecurringTransaction({
      type: 'expense',
      day_of_month: 15,
      title: '구독료',
      amount: 10000,
      category: '여가',
      bank_account: '신한은행'
    });
    
    expect(result).toEqual(mockNewTransaction);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should create recurring transaction with null optional fields', async () => {
    const mockNewTransaction: RecurringTransactionRow = {
      id: '4',
      type: 'income',
      day_of_month: 1,
      title: '부수입',
      amount: 50000,
      category: '',
      bank_account: '',
      is_active: true,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockNewTransaction]);
    
    const result = await createRecurringTransaction({
      type: 'income',
      day_of_month: 1,
      title: '부수입',
      amount: 50000
    });
    
    expect(result).toEqual(mockNewTransaction);
  });

  it('should update recurring transaction', async () => {
    const mockUpdatedTransaction: RecurringTransactionRow = {
      id: '1',
      type: 'expense',
      day_of_month: 10,
      title: '수정된 월세',
      amount: 550000,
      category: '주거비',
      bank_account: '국민은행',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    };
    
    (sql as any).mockReturnValue([mockUpdatedTransaction]);
    
    const result = await updateRecurringTransaction('1', {
      day_of_month: 10,
      title: '수정된 월세',
      amount: 550000
    });
    
    expect(result).toEqual(mockUpdatedTransaction);
  });

  it('should return null when updating non-existent transaction', async () => {
    (sql as any).mockReturnValue([]);
    
    const result = await updateRecurringTransaction('non-existent-id', {
      title: '수정된제목'
    });
    
    expect(result).toBeNull();
  });

  it('should delete recurring transaction', async () => {
    const mockDeletedTransaction: RecurringTransactionRow = {
      id: '1',
      type: 'expense',
      day_of_month: 5,
      title: '삭제될항목',
      amount: 100000,
      category: '기타',
      bank_account: '국민은행',
      is_active: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockDeletedTransaction]);
    
    const result = await deleteRecurringTransaction('1');
    
    expect(result).toEqual(mockDeletedTransaction);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return null when deleting non-existent transaction', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await deleteRecurringTransaction('non-existent-id');
    
    expect(result).toBeNull();
  });
});
