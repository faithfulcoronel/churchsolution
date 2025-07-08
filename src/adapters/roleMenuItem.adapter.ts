import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter } from './base.adapter';
import { RoleMenuItem } from '../models/roleMenuItem.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface IRoleMenuItemAdapter extends BaseAdapter<RoleMenuItem> {}

@injectable()
export class RoleMenuItemAdapter
  extends BaseAdapter<RoleMenuItem>
  implements IRoleMenuItemAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'role_menu_items';

  protected defaultSelect = `
    id,
    role_id,
    menu_item_id,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected override async onAfterCreate(data: RoleMenuItem): Promise<void> {
    await this.auditService.logAuditEvent('create', 'role_menu_item', data.id, data);
  }

  protected override async onAfterUpdate(data: RoleMenuItem): Promise<void> {
    await this.auditService.logAuditEvent('update', 'role_menu_item', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'role_menu_item', id, { id });
  }
}
