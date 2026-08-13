import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();

vi.mock('@/lib/supabase', () => ({
  requireSupabase: () => ({ rpc: mockRpc }),
}));

import { assertAdmin, AdminGuardError } from './adminGuard';

describe('assertAdmin', () => {
  beforeEach(() => mockRpc.mockReset());

  it('يحلّ للأدمن', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await expect(assertAdmin()).resolves.toBeUndefined();
  });

  it('يرمي AdminGuardError لغير الأدمن', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    await expect(assertAdmin()).rejects.toBeInstanceOf(AdminGuardError);
  });

  it('يرمي خطأ الاستدعاء عند فشل rpc (fail closed)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('network') });
    await expect(assertAdmin()).rejects.toThrow('network');
  });
});
