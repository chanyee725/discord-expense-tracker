import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('@/lib/db', () => ({
  default: vi.fn()
}));

import sql from '@/lib/db';
import { getAppSetting, setAppSetting } from '@/lib/queries';

describe('App Settings Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get app setting value for existing key', async () => {
    const mockResult = [{ value: 'test-value' }];
    
    (sql as any).mockResolvedValueOnce(mockResult);
    
    const result = await getAppSetting('test-key');
    expect(result).toBe('test-value');
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return null for missing key', async () => {
    const mockResult: any[] = [];
    
    (sql as any).mockResolvedValueOnce(mockResult);
    
    const result = await getAppSetting('non-existent-key');
    expect(result).toBeNull();
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should return null when value is undefined', async () => {
    const mockResult = [undefined];
    
    (sql as any).mockResolvedValueOnce(mockResult);
    
    const result = await getAppSetting('undefined-key');
    expect(result).toBeNull();
    expect(sql).toHaveBeenCalledOnce();
  });

  it('should set app setting using upsert', async () => {
    (sql as any).mockResolvedValueOnce(undefined);
    
    await setAppSetting('test-key', 'new-value');
    
    expect(sql).toHaveBeenCalledOnce();
  });
});
