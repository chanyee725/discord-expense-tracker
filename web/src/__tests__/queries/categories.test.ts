import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: vi.fn()
}));

import sql from '@/lib/db';
import { getCategories, getCategoriesByType } from '@/lib/queries';
import type { CategoryRow } from '@/lib/queries';

describe('Category Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockExpenseCategory: CategoryRow = {
    id: '1',
    name: '식비',
    type: 'expense',
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockIncomeCategory: CategoryRow = {
    id: '2',
    name: '급여',
    type: 'income',
    sort_order: 2,
    created_at: '2024-01-02T00:00:00Z'
  };

  const mockBothCategory: CategoryRow = {
    id: '3',
    name: '기타',
    type: 'both',
    sort_order: 3,
    created_at: '2024-01-03T00:00:00Z'
  };

  it('should get all categories without filter', async () => {
    const mockCategories: CategoryRow[] = [
      mockExpenseCategory,
      mockIncomeCategory,
      mockBothCategory
    ];
    
    (sql as any).mockResolvedValueOnce(mockCategories);
    
    const result = await getCategories();
    expect(result).toEqual(mockCategories);
    expect(result).toHaveLength(3);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should get expense categories including both type', async () => {
    const mockExpenseCategories: CategoryRow[] = [
      mockExpenseCategory,
      mockBothCategory
    ];
    
    (sql as any).mockResolvedValueOnce(mockExpenseCategories);
    
    const result = await getCategories('expense');
    expect(result).toEqual(mockExpenseCategories);
    expect(result).toHaveLength(2);
    expect(result.some(c => c.type === 'expense')).toBe(true);
    expect(result.some(c => c.type === 'both')).toBe(true);
    expect(result.some(c => c.type === 'income')).toBe(false);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should get income categories including both type', async () => {
    const mockIncomeCategories: CategoryRow[] = [
      mockIncomeCategory,
      mockBothCategory
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeCategories);
    
    const result = await getCategories('income');
    expect(result).toEqual(mockIncomeCategories);
    expect(result).toHaveLength(2);
    expect(result.some(c => c.type === 'income')).toBe(true);
    expect(result.some(c => c.type === 'both')).toBe(true);
    expect(result.some(c => c.type === 'expense')).toBe(false);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return empty array when no categories exist', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await getCategories();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should get categories by type using convenience wrapper for expense', async () => {
    const mockExpenseCategories: CategoryRow[] = [
      mockExpenseCategory,
      mockBothCategory
    ];
    
    (sql as any).mockResolvedValueOnce(mockExpenseCategories);
    
    const result = await getCategoriesByType('expense');
    expect(result).toEqual(mockExpenseCategories);
    expect(result).toHaveLength(2);
  });

  it('should get categories by type using convenience wrapper for income', async () => {
    const mockIncomeCategories: CategoryRow[] = [
      mockIncomeCategory,
      mockBothCategory
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeCategories);
    
    const result = await getCategoriesByType('income');
    expect(result).toEqual(mockIncomeCategories);
    expect(result).toHaveLength(2);
  });
});
