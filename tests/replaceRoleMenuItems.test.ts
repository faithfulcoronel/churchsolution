import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleMenuItemRepository } from '../src/repositories/roleMenuItem.repository';
import type { IRoleMenuItemAdapter } from '../src/adapters/roleMenuItem.adapter';

vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn().mockResolvedValue('t1') }
}));

const eqMock = vi.fn(() => ({ eq: eqMock }));
const deleteMock = vi.fn(() => ({ eq: eqMock }));
const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({ delete: deleteMock, insert: insertMock })),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) }
  }
}));

class TestRepo extends RoleMenuItemRepository {
  constructor() {
    super({} as IRoleMenuItemAdapter);
  }
}

describe('replaceRoleMenuItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes existing and inserts new records', async () => {
    const repo = new TestRepo();
    await repo.replaceRoleMenuItems('r1', ['m1', 'm2']);
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('tenant_id', 't1');
    expect(insertMock).toHaveBeenCalled();
    const rows = insertMock.mock.calls[0][0];
    expect(rows).toHaveLength(2);
    expect(rows[0].role_id).toBe('r1');
    expect(rows[0].menu_item_id).toBe('m1');
  });
});
