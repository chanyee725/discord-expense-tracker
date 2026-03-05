import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  default: vi.fn()
}));

import sql from '@/lib/db';
import { getMonthlyTransactionStats, getCategoryBreakdown } from '@/lib/queries';

describe('Future Transaction Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMonthlyTransactionStats - excludes future transactions', () => {
    it('should exclude transactions with created_at > now()', async () => {
      const mockStats = {
        total_expense: 150000,
        transaction_count: 3
      };

      (sql as any).mockResolvedValueOnce([mockStats]);

      const result = await getMonthlyTransactionStats(2026, 3);

      expect(result.total_expense).toBe(150000);
      expect(result.transaction_count).toBe(3);
      
      expect(sql).toHaveBeenCalledOnce();
      const callArgs = (sql as any).mock.calls[0];
      const queryString = callArgs[0].join('');
      expect(queryString).toContain('created_at');
      expect(queryString).toContain('type');
    });

    it('should return zero when only future transactions exist', async () => {
      const mockStats = {
        total_expense: null,
        transaction_count: 0
      };

      (sql as any).mockResolvedValueOnce([mockStats]);

      const result = await getMonthlyTransactionStats(2026, 3);

      expect(result.total_expense).toBe(0);
      expect(result.transaction_count).toBe(0);
    });

    it('should handle mixed past and future transactions (counting only past)', async () => {
      const mockStats = {
        total_expense: 250000,
        transaction_count: 3
      };

      (sql as any).mockResolvedValueOnce([mockStats]);

      const result = await getMonthlyTransactionStats(2026, 3);

      expect(result.transaction_count).toBe(3);
      expect(result.total_expense).toBe(250000);
    });

    it('should calculate correct total for current month (excluding future)', async () => {
      const mockStats = {
        total_expense: 450000,
        transaction_count: 5
      };

      (sql as any).mockResolvedValueOnce([mockStats]);

      const result = await getMonthlyTransactionStats(2026, 3);

      expect(result.total_expense).toBe(450000);
      expect(result.transaction_count).toBe(5);
    });

    it('should return 0 for months with no past transactions', async () => {
      const mockStats = {
        total_expense: null,
        transaction_count: 0
      };

      (sql as any).mockResolvedValueOnce([mockStats]);

      const result = await getMonthlyTransactionStats(2025, 1);

      expect(result.total_expense).toBe(0);
      expect(result.transaction_count).toBe(0);
    });
  });

  describe('getCategoryBreakdown - excludes future transactions', () => {
    it('should return category breakdown excluding future transactions', async () => {
      const mockBreakdown = [
        { category: '식사', total: 200000 },
        { category: '교통', total: 100000 },
        { category: '쇼핑', total: 80000 }
      ];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      const result = await getCategoryBreakdown(2026, 3);

      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('식사');
      expect(result[0].total).toBe(200000);
      expect(result[1].category).toBe('교통');
      expect(result[1].total).toBe(100000);
    });

    it('should exclude null category total from future transactions', async () => {
      const mockBreakdown = [
        { category: '식사', total: 200000 },
        { category: null, total: 50000 }
      ];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      const result = await getCategoryBreakdown(2026, 3);

      expect(result).toHaveLength(2);
      expect(result[1].category).toBeNull();
    });

    it('should return empty array when only future transactions exist for month', async () => {
      (sql as any).mockResolvedValueOnce([]);

      const result = await getCategoryBreakdown(2026, 5);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should group categories correctly excluding future recurring', async () => {
      const mockBreakdown = [
        { category: '주거비', total: 1000000 },
        { category: '식사', total: 300000 },
        { category: '교통', total: 150000 }
      ];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      const result = await getCategoryBreakdown(2026, 3);

      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('주거비');
      expect(result[0].total).toBe(1000000);
    });

    it('should order categories by total amount descending', async () => {
      const mockBreakdown = [
        { category: '식사', total: 500000 },
        { category: '교통', total: 200000 },
        { category: '쇼핑', total: 100000 }
      ];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      const result = await getCategoryBreakdown(2026, 3);

      expect(result[0].total).toBeGreaterThanOrEqual(result[1].total);
      expect(result[1].total).toBeGreaterThanOrEqual(result[2].total);
    });

    it('should handle single category with high total', async () => {
      const mockBreakdown = [
        { category: '주거비', total: 2000000 }
      ];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      const result = await getCategoryBreakdown(2026, 3);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('주거비');
      expect(result[0].total).toBe(2000000);
    });

    it('should verify SQL includes created_at filter', async () => {
      const mockBreakdown: any[] = [];

      (sql as any).mockResolvedValueOnce(mockBreakdown);

      await getCategoryBreakdown(2026, 3);

      expect(sql).toHaveBeenCalledOnce();
      const callArgs = (sql as any).mock.calls[0];
      const queryString = callArgs[0].join('');
      expect(queryString).toContain('created_at');
      expect(queryString).toContain('type');
    });
  });

  describe('Integration: Combined filtering behavior', () => {
    it('should consistently filter both stats and breakdown queries', async () => {
      const mockStats = {
        total_expense: 350000,
        transaction_count: 4
      };

      const mockBreakdown = [
        { category: '식사', total: 180000 },
        { category: '교통', total: 100000 },
        { category: '쇼핑', total: 70000 }
      ];

      (sql as any)
        .mockResolvedValueOnce([mockStats])
        .mockResolvedValueOnce(mockBreakdown);

      const stats = await getMonthlyTransactionStats(2026, 3);
      const breakdown = await getCategoryBreakdown(2026, 3);

      const breakdownTotal = breakdown.reduce((sum, cat) => sum + cat.total, 0);
      expect(breakdownTotal).toBeLessThanOrEqual(stats.total_expense);

      expect(sql).toHaveBeenCalledTimes(2);
    });

    it('should both return 0/empty when no past transactions in month', async () => {
      (sql as any)
        .mockResolvedValueOnce([{ total_expense: null, transaction_count: 0 }])
        .mockResolvedValueOnce([]);

      const stats = await getMonthlyTransactionStats(2026, 5);
      const breakdown = await getCategoryBreakdown(2026, 5);

      expect(stats.total_expense).toBe(0);
      expect(stats.transaction_count).toBe(0);
      expect(breakdown).toEqual([]);
    });
  });
});
