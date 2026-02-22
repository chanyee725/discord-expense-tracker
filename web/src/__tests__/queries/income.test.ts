import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: vi.fn()
}));

import sql from '@/lib/db';
import { getMonthlyIncome } from '@/lib/queries';

describe('Income Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get monthly income for given year', async () => {
    const mockIncomeData = [
      { month: 1, total: 3000000 },
      { month: 2, total: 3200000 },
      { month: 3, total: 3100000 }
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeData);
    
    const result = await getMonthlyIncome(2024);
    
    expect(result).toEqual(mockIncomeData);
    expect(result).toHaveLength(3);
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return empty array when no income exists for year', async () => {
    (sql as any).mockResolvedValueOnce([]);
    
    const result = await getMonthlyIncome(2023);
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should group income by month correctly', async () => {
    const mockIncomeData = [
      { month: 1, total: 5000000 },
      { month: 6, total: 3500000 },
      { month: 12, total: 4000000 }
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeData);
    
    const result = await getMonthlyIncome(2024);
    
    expect(result).toHaveLength(3);
    expect(result[0].month).toBe(1);
    expect(result[1].month).toBe(6);
    expect(result[2].month).toBe(12);
    expect(result.every(item => typeof item.month === 'number')).toBe(true);
    expect(result.every(item => typeof item.total === 'number')).toBe(true);
  });

  it('should return results in ascending month order', async () => {
    const mockIncomeData = [
      { month: 3, total: 3000000 },
      { month: 7, total: 3500000 },
      { month: 11, total: 4000000 }
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeData);
    
    const result = await getMonthlyIncome(2024);
    
    expect(result[0].month).toBeLessThan(result[1].month);
    expect(result[1].month).toBeLessThan(result[2].month);
  });

  it('should handle single month income', async () => {
    const mockIncomeData = [
      { month: 5, total: 10000000 }
    ];
    
    (sql as any).mockResolvedValueOnce(mockIncomeData);
    
    const result = await getMonthlyIncome(2024);
    
    expect(result).toHaveLength(1);
    expect(result[0].month).toBe(5);
    expect(result[0].total).toBe(10000000);
  });

  it('should handle all 12 months of income', async () => {
    const mockIncomeData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 3000000 + (i * 100000)
    }));
    
    (sql as any).mockResolvedValueOnce(mockIncomeData);
    
    const result = await getMonthlyIncome(2024);
    
    expect(result).toHaveLength(12);
    expect(result[0].month).toBe(1);
    expect(result[11].month).toBe(12);
  });
});
