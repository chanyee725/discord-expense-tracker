import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/db', () => {
  const mockFn: any = vi.fn();
  mockFn.mockImplementation((...args: any[]) => {
    if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
      return 'SQL_FRAGMENT';
    }
    return mockFn;
  });
  mockFn.begin = vi.fn();
  return {
    default: mockFn
  };
});

import sql from '@/lib/db';
import { getNextBusinessDay, generateRecurringTransactions } from '@/lib/queries';

describe('getNextBusinessDay', () => {
  it('returns same date for weekday (Monday-Friday)', () => {
    // Monday, Feb 23, 2026
    const result = getNextBusinessDay(2026, 2, 23);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1); // 0-indexed (1 = Feb)
    expect(result.getDate()).toBe(23);
  });

  it('shifts Saturday to Monday (+2 days)', () => {
    // Saturday, Feb 21, 2026 → Monday, Feb 23
    const result = getNextBusinessDay(2026, 2, 21);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(23);
  });

  it('shifts Sunday to Monday (+1 day)', () => {
    // Sunday, Feb 22, 2026 → Monday, Feb 23
    const result = getNextBusinessDay(2026, 2, 22);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(23);
  });

  it('clamps day 31 to last day of February, then checks weekend', () => {
    // Feb 2026 has 28 days, Feb 28 is Saturday → Monday, Mar 2
    const result = getNextBusinessDay(2026, 2, 31);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2); // March (0-indexed = 2)
    expect(result.getDate()).toBe(2);
  });

  it('handles month overflow (Saturday Jan 31 → Monday Feb 2)', () => {
    // Saturday, Jan 31, 2026 → Monday, Feb 2, 2026
    const result = getNextBusinessDay(2026, 1, 31);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1); // February (0-indexed)
    expect(result.getDate()).toBe(2);
  });
});

describe('generateRecurringTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sql as any).mockImplementation((...args: any[]) => {
      if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
        return 'SQL_FRAGMENT';
      }
      return sql;
    });
    (sql as any).begin = vi.fn();
  });

  it('returns generated=0, skipped=0 when already generated', async () => {
    // Mock: existing log entry for (2026, 2) with one template
    const mockTemplate = {
      id: 'rec-1',
      type: 'expense',
      day_of_month: 15,
      title: 'Test Expense',
      amount: 1000,
      category: 'Food',
      bank_account: '우리은행',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    const mockLog = {
      recurring_transaction_id: 'rec-1',
      year: 2026,
      month: 2,
      transaction_id: 'txn-1',
      generated_at: '2026-02-15T00:00:00Z'
    };

    let callCount = 0;
    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      callCount++;
      const query = Array.isArray(strings) ? strings.join('') : strings;
      
      if (query.includes('recurring_transactions')) {
        return Promise.resolve([mockTemplate]);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([mockLog]); // Already logged
      }
      return Promise.resolve([]);
    });

    const result = await generateRecurringTransactions(2026, 2);
    expect(result.generated).toBe(0);
    expect(result.skipped).toBe(0);
  });

  it('generates expense transaction with type="지출" and withdrawal_source', async () => {
    const mockTemplate = {
      id: 'rec-expense',
      type: 'expense',
      day_of_month: 15,
      title: '월세',
      amount: 500000,
      category: '주거비',
      bank_account: '우리은행',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    let capturedInsertQuery = '';
    let capturedValues: any[] = [];

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve([mockTemplate]);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          capturedInsertQuery = query;
          capturedValues = values;
          return Promise.resolve([{ id: 'txn-1' }]);
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      return callback(mockTx);
    });

    const result = await generateRecurringTransactions(2026, 2);
    
    expect(result.generated).toBe(1);
    expect(result.skipped).toBe(0);
    expect((sql as any).begin).toHaveBeenCalled();
    
    // Verify captured values include '지출' and withdrawal_source
    const typeIndex = capturedValues.findIndex(v => v === '지출');
    expect(typeIndex).toBeGreaterThanOrEqual(0);
    expect(capturedInsertQuery).toContain('withdrawal_source');
  });

  it('generates income transaction with type="수입" and deposit_destination', async () => {
    const mockTemplate = {
      id: 'rec-income',
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

    let capturedInsertQuery = '';
    let capturedValues: any[] = [];

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve([mockTemplate]);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          capturedInsertQuery = query;
          capturedValues = values;
          return Promise.resolve([{ id: 'txn-2' }]);
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      return callback(mockTx);
    });

    const result = await generateRecurringTransactions(2026, 2);
    
    expect(result.generated).toBe(1);
    expect(result.skipped).toBe(0);
    expect((sql as any).begin).toHaveBeenCalled();
    
    // Verify captured values include '수입' and deposit_destination
    const typeIndex = capturedValues.findIndex(v => v === '수입');
    expect(typeIndex).toBeGreaterThanOrEqual(0);
    expect(capturedInsertQuery).toContain('deposit_destination');
  });

  it('uses calculated business day for created_at, not now()', async () => {
    const mockTemplate = {
      id: 'rec-business-day',
      type: 'expense',
      day_of_month: 22, // Sunday in Feb 2026
      title: 'Test',
      amount: 1000,
      category: 'Test',
      bank_account: 'Bank',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    let capturedCreatedAt: any = null;

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve([mockTemplate]);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          // In the VALUES clause: title, amount, type, category, 
          // deposit_destination, withdrawal_source, transaction_date, raw_ocr_text, created_at
          // created_at is the 9th value (index 8)
          if (values.length >= 9) {
            capturedCreatedAt = values[8];
          }
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([{ id: 'txn-3' }]);
      });
      return callback(mockTx);
    });

    await generateRecurringTransactions(2026, 2);

    // For Feb 22, 2026 (Sunday), should shift to Feb 23 (Monday)
    const expected = getNextBusinessDay(2026, 2, 22);
    
    // Verify created_at is a Date object
    expect(capturedCreatedAt).toBeInstanceOf(Date);
    
    // Verify the date matches the calculated business day
    expect(capturedCreatedAt?.getFullYear()).toBe(expected.getFullYear());
    expect(capturedCreatedAt?.getMonth()).toBe(expected.getMonth());
    expect(capturedCreatedAt?.getDate()).toBe(expected.getDate());
  });

  it('handles multiple templates and generates all non-duplicates', async () => {
    const mockTemplates = [
      {
        id: 'rec-1',
        type: 'expense',
        day_of_month: 5,
        title: '구독',
        amount: 10000,
        category: '여가',
        bank_account: '신한은행',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'rec-2',
        type: 'income',
        day_of_month: 15,
        title: '부수입',
        amount: 50000,
        category: '기타',
        bank_account: '카카오뱅크',
        is_active: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
    ];

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve(mockTemplates);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    let transactionCount = 0;
    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          transactionCount++;
          return Promise.resolve([{ id: `txn-${transactionCount}` }]);
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      return callback(mockTx);
    });

    const result = await generateRecurringTransactions(2026, 2);
    
    expect(result.generated).toBe(2);
    expect(result.skipped).toBe(0);
    expect((sql as any).begin).toHaveBeenCalledTimes(2);
  });

  it('filters by day when day parameter is provided', async () => {
    const mockTemplates = [
      {
        id: 'rec-day-5',
        type: 'expense',
        day_of_month: 5,
        title: 'Day 5 Expense',
        amount: 1000,
        category: 'Test',
        bank_account: 'Bank',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'rec-day-15',
        type: 'expense',
        day_of_month: 15,
        title: 'Day 15 Expense',
        amount: 2000,
        category: 'Test',
        bank_account: 'Bank',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'rec-day-25',
        type: 'expense',
        day_of_month: 25,
        title: 'Day 25 Expense',
        amount: 3000,
        category: 'Test',
        bank_account: 'Bank',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve(mockTemplates);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    let transactionCount = 0;
    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          transactionCount++;
          return Promise.resolve([{ id: `txn-${transactionCount}` }]);
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      return callback(mockTx);
    });

    const result = await generateRecurringTransactions(2026, 2, 15);
    
    expect(result.generated).toBe(1);
    expect(result.skipped).toBe(0);
    expect((sql as any).begin).toHaveBeenCalledTimes(1);
  });

  it('generates all templates when day parameter is omitted', async () => {
    const mockTemplates = [
      {
        id: 'rec-1',
        type: 'expense',
        day_of_month: 5,
        title: 'Template 1',
        amount: 1000,
        category: 'Test',
        bank_account: 'Bank',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'rec-2',
        type: 'expense',
        day_of_month: 15,
        title: 'Template 2',
        amount: 2000,
        category: 'Test',
        bank_account: 'Bank',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    (sql as any).mockImplementation((strings: any, ...values: any[]) => {
      const query = Array.isArray(strings) ? strings.join('') : strings;
      if (query.includes('recurring_transactions')) {
        return Promise.resolve(mockTemplates);
      }
      if (query.includes('recurring_transaction_log')) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    let transactionCount = 0;
    (sql as any).begin = vi.fn(async (callback: any) => {
      const mockTx = vi.fn(async (strings: any, ...values: any[]) => {
        const query = Array.isArray(strings) ? strings.join('') : strings;
        if (query.includes('INSERT INTO transactions')) {
          transactionCount++;
          return Promise.resolve([{ id: `txn-${transactionCount}` }]);
        }
        if (query.includes('UPDATE bank_accounts')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO recurring_transaction_log')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      return callback(mockTx);
    });

    const result = await generateRecurringTransactions(2026, 2);
    
    expect(result.generated).toBe(2);
    expect(result.skipped).toBe(0);
    expect((sql as any).begin).toHaveBeenCalledTimes(2);
  });
});
