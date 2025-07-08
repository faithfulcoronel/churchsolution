import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { MenuItem } from '../models/menuItem.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface IMenuItemAdapter extends BaseAdapter<MenuItem> {}

@injectable()
export class MenuItemAdapter
  extends BaseAdapter<MenuItem>
  implements IMenuItemAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'menu_items';

  protected defaultSelect = `
    id,
    parent_id,
    code,
    label,
    path,
    icon,
    sort_order,
    is_system,
    section,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    {
      table: 'menu_permissions',
      foreignKey: 'menu_item_id',
      select: ['permission_id'],
    },
  ];

  protected override async onAfterCreate(data: MenuItem): Promise<void> {
    await this.auditService.logAuditEvent('create', 'menu_item', data.id, data);
  }

  protected override async onAfterUpdate(data: MenuItem): Promise<void> {
    await this.auditService.logAuditEvent('update', 'menu_item', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'menu_item', id, { id });
  }
}
