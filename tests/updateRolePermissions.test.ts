import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleRepository } from '../src/repositories/role.repository';
import type { IRoleAdapter } from '../src/adapters/role.adapter';

vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn().mockResolvedValue('t1') }
}));

const eqMock = vi.fn(() => ({ eq: eqMock }));
const deleteMock = vi.fn(() => ({ eq: eqMock }));
const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

const mpChain = {
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  eq: vi.fn(() =>
    Promise.resolve({ data: [{ menu_item_id: 'm1' }, { menu_item_id: 'm2' }], error: null })
  ),
};

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'menu_permissions') return mpChain as any;
      if (table === 'role_menu_items') return { delete: deleteMock, insert: insertMock } as any;
      return {} as any;
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
  }
}));

class TestRepo extends RoleRepository {
  constructor() {
    super({} as IRoleAdapter);
  }
}

describe('updateRolePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes existing and inserts new records', async () => {
    const repo = new TestRepo();
    await repo.updateRolePermissions('r1', ['p1', 'p2']);
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('tenant_id', 't1');
    expect(insertMock).toHaveBeenCalled();
    const rows = insertMock.mock.calls[0][0];
    expect(rows).toHaveLength(2);
    expect(rows[0].role_id).toBe('r1');
    expect(rows[0].menu_item_id).toBe('m1');
  });
});
