import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter } from './base.adapter';
import { User } from '../models/user.model';
import { TYPES } from '../lib/types';
import { AuditService } from '../services/AuditService';

export interface IUserAdapter extends BaseAdapter<User> {}

@injectable()
export class UserAdapter extends BaseAdapter<User> implements IUserAdapter {
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'users';

  protected defaultSelect = `
    id,
    email,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data,
    raw_app_meta_data,
    phone
  `;

  protected override async onAfterCreate(data: User): Promise<void> {
    await this.auditService.logAuditEvent('create', 'user', data.id, data);
  }

  protected override async onAfterUpdate(data: User): Promise<void> {
    await this.auditService.logAuditEvent('update', 'user', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'user', id, { id });
  }
}
