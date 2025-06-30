import { describe, it, expect } from 'vitest';
import { RoleRepository } from '../src/repositories/role.repository';
import type { IRoleAdapter } from '../src/adapters/role.adapter';
import type { Role } from '../src/models/role.model';

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
});
