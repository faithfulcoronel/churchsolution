import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IUserRoleRepository } from '../repositories/userRole.repository';
import type { IRoleRepository } from '../repositories/role.repository';
import { tenantUtils } from '../utils/tenantUtils';

@injectable()
export class UserRoleService {
  constructor(
    @inject(TYPES.IUserRoleRepository)
    private repo: IUserRoleRepository,
    @inject(TYPES.IRoleRepository)
    private roleRepo: IRoleRepository,
  ) {}

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) throw new Error('No tenant context found');

    if (roleIds.length) {
      const { data: roles } = await this.roleRepo.find({
        filters: {
          id: { operator: 'isAnyOf', value: roleIds },
          tenant_id: { operator: 'eq', value: tenantId },
        },
      });
      const found = roles.map(r => r.id);
      if (found.length !== roleIds.length) {
        throw new Error('Invalid role ids');
      }
    }

    await this.repo.replaceUserRoles(userId, roleIds);
  }
}
