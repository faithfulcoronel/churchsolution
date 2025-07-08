import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter } from './base.adapter';
import { UserRole } from '../models/userRole.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface IUserRoleAdapter extends BaseAdapter<UserRole> {}

@injectable()
export class UserRoleAdapter
  extends BaseAdapter<UserRole>
  implements IUserRoleAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'user_roles';

  protected defaultSelect = `
    id,
    user_id,
    role_id,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected override async onAfterCreate(data: UserRole): Promise<void> {
    await this.auditService.logAuditEvent('create', 'user_role', data.id, data);
  }

  protected override async onAfterUpdate(data: UserRole): Promise<void> {
    await this.auditService.logAuditEvent('update', 'user_role', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'user_role', id, { id });
  }
}
