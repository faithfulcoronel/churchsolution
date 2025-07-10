import { describe, it, expect, vi, beforeEach } from 'vitest';

const queryChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  then: vi.fn((resolve) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve))
};

vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn() }
}));

vi.mock('../src/utils/userRoleUtils', () => ({
  userRoleUtils: { isSuperAdmin: vi.fn() }
}));

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: vi.fn(() => queryChain) }
}));

import { computeAccess } from '../src/utils/access';
import { BaseAdapter } from '../src/adapters/base.adapter';
import { tenantUtils } from '../src/utils/tenantUtils';
import { userRoleUtils } from '../src/utils/userRoleUtils';

class TestAdapter extends BaseAdapter<any> {
  protected tableName = 'items';
}

describe('super admin access', () => {
  it('grants access when user is super admin', () => {
    const allowed = computeAccess(
      () => false,
      () => false,
      'any.permission',
      'any.feature',
      true
    );
    expect(allowed).toBe(true);
  });
});

describe('BaseAdapter fetch super admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips tenant filter when super admin', async () => {
    (tenantUtils.getTenantId as any).mockResolvedValue(null);
    (userRoleUtils.isSuperAdmin as any).mockResolvedValue(true);

    const adapter = new TestAdapter();
    await adapter.fetch();

    expect(queryChain.eq).not.toHaveBeenCalledWith('tenant_id', expect.anything());
  });

  it('applies tenant filter for regular user', async () => {
    (tenantUtils.getTenantId as any).mockResolvedValue('t1');
    (userRoleUtils.isSuperAdmin as any).mockResolvedValue(false);

    const adapter = new TestAdapter();
    await adapter.fetch();

    expect(queryChain.eq).toHaveBeenCalledWith('tenant_id', 't1');
  });
});
