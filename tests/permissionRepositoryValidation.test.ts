import { describe, it, expect } from 'vitest';
import { PermissionRepository } from '../src/repositories/permission.repository';
import type { IPermissionAdapter } from '../src/adapters/permission.adapter';
import type { Permission } from '../src/models/permission.model';

class TestPermissionRepository extends PermissionRepository {
  public async runBeforeCreate(data: Partial<Permission>) {
    // @ts-ignore access protected
    return this.beforeCreate(data);
  }
  public async runBeforeUpdate(id: string, data: Partial<Permission>) {
    // @ts-ignore access protected
    return this.beforeUpdate(id, data);
  }
}

describe('PermissionRepository validation', () => {
  it('throws error for missing name on create', async () => {
    const repo = new TestPermissionRepository({} as IPermissionAdapter);
    await expect(
      repo.runBeforeCreate({ name: ' ', code: 'user.view', module: 'users' })
    ).rejects.toThrow('Permission name is required');
  });

  it('throws error for missing code', async () => {
    const repo = new TestPermissionRepository({} as IPermissionAdapter);
    await expect(
      repo.runBeforeCreate({ name: 'View Users', code: ' ', module: 'users' } as any)
    ).rejects.toThrow('Permission code is required');
  });

  it('throws error for invalid code', async () => {
    const repo = new TestPermissionRepository({} as IPermissionAdapter);
    await expect(
      repo.runBeforeCreate({ name: 'View Users', code: 'bad', module: 'users' })
    ).rejects.toThrow('Invalid permission code');
  });

  it('formats data on create', async () => {
    const repo = new TestPermissionRepository({} as IPermissionAdapter);
    const data = await repo.runBeforeCreate({
      name: ' View Users ',
      code: ' user.view ',
      description: ' Desc ',
      module: ' Users '
    });
    expect(data).toEqual({
      name: 'View Users',
      code: 'user.view',
      description: 'Desc',
      module: 'users'
    });
  });

  it('validates on update', async () => {
    const repo = new TestPermissionRepository({} as IPermissionAdapter);
    await expect(
      repo.runBeforeUpdate('1', { name: '', code: 'user.view', module: 'users' })
    ).rejects.toThrow('Permission name is required');
  });
});
