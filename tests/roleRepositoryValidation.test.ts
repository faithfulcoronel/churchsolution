import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleRepository } from '../src/repositories/role.repository';
import type { IRoleAdapter } from '../src/adapters/role.adapter';
import type { Role } from '../src/models/role.model';

const permChain = {
  select: vi.fn().mockReturnThis(),
  in: vi.fn(),
};

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => permChain),
  },
}));

class TestRoleRepository extends RoleRepository {
  public async runBeforeCreate(data: Partial<Role>) {
    // @ts-ignore access protected
    return this.beforeCreate(data);
  }
  public async runBeforeUpdate(id: string, data: Partial<Role>) {
    // @ts-ignore access protected
    return this.beforeUpdate(id, data);
  }
}

describe('RoleRepository validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('throws error for missing name on create', async () => {
    const repo = new TestRoleRepository({} as IRoleAdapter);
    await expect(repo.runBeforeCreate({ name: ' ' })).rejects.toThrow('Role name is required');
  });

  it('formats data on create', async () => {
    const repo = new TestRoleRepository({} as IRoleAdapter);
    const data = await repo.runBeforeCreate({ name: '  admin ', description: ' Desc ' });
    expect(data.name).toBe('admin');
    expect(data.description).toBe('Desc');
  });

  it('validates on update', async () => {
    const repo = new TestRoleRepository({} as IRoleAdapter);
    await expect(repo.runBeforeUpdate('1', { name: '' })).rejects.toThrow('Role name is required');
  });

  it('throws error for duplicate name', async () => {
    const repo = new TestRoleRepository({} as IRoleAdapter);
    vi.spyOn(repo, 'find').mockResolvedValue({ data: [{ id: 'r1' }], count: 1 });
    await expect(repo.runBeforeCreate({ name: 'admin' })).rejects.toThrow('A role with this name already exists');
  });

  it('throws error for invalid permissions', async () => {
    const repo = new TestRoleRepository({} as IRoleAdapter);
    vi.spyOn(repo, 'find').mockResolvedValue({ data: [], count: 0 });
    permChain.in.mockResolvedValue({ data: [{ id: 'p1' }], error: null });
    await expect(
      repo.runBeforeCreate({ name: 'admin', permissionIds: ['p1', 'p2'] } as any)
    ).rejects.toThrow('Invalid permission ids');
  });
});
