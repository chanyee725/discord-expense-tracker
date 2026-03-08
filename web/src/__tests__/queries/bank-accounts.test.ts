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
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from '@/lib/queries';
import type { BankAccountRow } from '@/lib/queries';

describe('Bank Account Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sql as any).mockImplementation((...args: any[]) => {
      if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
        return 'SQL_FRAGMENT';
      }
      return sql;
    });
  });

  it('should get all bank accounts', async () => {
    const mockAccounts: BankAccountRow[] = [
      {
        id: '1',
        bank_name: '국민은행',
        name: '테스트계좌',
        account_number: '123-456-789',
        account_type: 'bank',
        balance: 1000000,
        deposit_balance: 0,
        investment_balance: 0,
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        bank_name: '카카오뱅크',
        name: '저축계좌',
        account_number: '111-222-333',
        account_type: 'bank',
        balance: 500000,
        deposit_balance: 0,
        investment_balance: 0,
        sort_order: 2,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
    ];
    
    (sql as any).mockResolvedValueOnce(mockAccounts);
    
    const result = await getBankAccounts();
    expect(result).toEqual(mockAccounts);
    expect(result).toHaveLength(2);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return empty array when no accounts exist', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await getBankAccounts();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should create bank account', async () => {
    const mockAccount: BankAccountRow = {
      id: '3',
      bank_name: '신한은행',
      name: '새계좌',
      account_number: '999-888-777',
      account_type: 'bank',
      balance: 2000000,
      deposit_balance: 0,
      investment_balance: 0,
      sort_order: 3,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockAccount]);
    
    const result = await createBankAccount({
      bank_name: '신한은행',
      name: '새계좌',
      balance: 2000000,
      sort_order: 3
    });
    
    expect(result).toEqual(mockAccount);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should create bank account with default sort_order', async () => {
    const mockAccount: BankAccountRow = {
      id: '4',
      bank_name: '우리은행',
      name: '기본계좌',
      account_number: null,
      account_type: 'bank',
      balance: 100000,
      deposit_balance: 0,
      investment_balance: 0,
      sort_order: 0,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockAccount]);
    
    const result = await createBankAccount({
      bank_name: '우리은행',
      name: '기본계좌',
      balance: 100000
    });
    
    expect(result).toEqual(mockAccount);
  });

  it('should update bank account', async () => {
    const mockUpdatedAccount: BankAccountRow = {
      id: '1',
      bank_name: '국민은행',
      name: '수정된계좌',
      account_number: '123-456-789',
      account_type: 'bank',
      balance: 1500000,
      deposit_balance: 0,
      investment_balance: 0,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    };
    
    (sql as any).mockReturnValue([mockUpdatedAccount]);
    
    const result = await updateBankAccount('1', {
      name: '수정된계좌',
      balance: 1500000
    });
    
    expect(result).toEqual(mockUpdatedAccount);
  });

  it('should return null when updating non-existent account', async () => {
    (sql as any).mockReturnValue([]);
    
    const result = await updateBankAccount('non-existent-id', {
      name: '수정된계좌'
    });
    
    expect(result).toBeNull();
  });

  it('should delete bank account', async () => {
    const mockDeletedAccount: BankAccountRow = {
      id: '1',
      bank_name: '국민은행',
      name: '삭제계좌',
      account_number: '123-456-789',
      account_type: 'bank',
      balance: 0,
      deposit_balance: 0,
      investment_balance: 0,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    };
    
    (sql as any).mockResolvedValueOnce([mockDeletedAccount]);
    
    const result = await deleteBankAccount('1');
    
    expect(result).toEqual(mockDeletedAccount);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return null when deleting non-existent account', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await deleteBankAccount('non-existent-id');
    
    expect(result).toBeNull();
  });
});
