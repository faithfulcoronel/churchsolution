import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRoleService } from '../src/services/UserRoleService';
import type { IUserRoleRepository } from '../src/repositories/userRole.repository';
import type { IRoleRepository } from '../src/repositories/role.repository';

vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn().mockResolvedValue('t1') }
}));

const repo: IUserRoleRepository = {
  replaceUserRoles: vi.fn().mockResolvedValue(undefined)
} as unknown as IUserRoleRepository;

const roleRepo: IRoleRepository = {
  find: vi.fn()
} as unknown as IRoleRepository;

const service = new UserRoleService(repo, roleRepo);

describe('UserRoleService.assignRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('replaces roles after validation', async () => {
    (roleRepo.find as any).mockResolvedValue({ data: [{ id: 'r1' }, { id: 'r2' }] });
    await service.assignRoles('u1', ['r1', 'r2']);
    expect(roleRepo.find).toHaveBeenCalledWith({
      filters: { id: { operator: 'isAnyOf', value: ['r1', 'r2'] }, tenant_id: { operator: 'eq', value: 't1' } }
    });
    expect(repo.replaceUserRoles).toHaveBeenCalledWith('u1', ['r1', 'r2']);
  });

  it('throws for roles outside tenant', async () => {
    (roleRepo.find as any).mockResolvedValue({ data: [{ id: 'r1' }] });
    await expect(service.assignRoles('u1', ['r1', 'r2'])).rejects.toThrow('Invalid role ids');
  });
});
