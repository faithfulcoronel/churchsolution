import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Role } from '../models/role.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';

export interface IRoleAdapter extends BaseAdapter<Role> {}

@injectable()
export class RoleAdapter extends BaseAdapter<Role> implements IRoleAdapter {
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'roles';

  protected defaultSelect = `
    id,
    name,
    description,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    {
      table: 'role_menu_items',
      foreignKey: 'role_id',
      nestedRelationships: [
        {
          table: 'menu_items',
          foreignKey: 'menu_item_id',
          select: [
            'id',
            'parent_id',
            'code',
            'label',
            'path',
            'icon',
            'sort_order',
            'is_system',
            'section',
            'feature_key'
          ]
        }
      ]
    }
  ];

  protected override async onAfterCreate(data: Role): Promise<void> {
    await this.auditService.logAuditEvent('create', 'role', data.id, data);
  }

  protected override async onAfterUpdate(data: Role): Promise<void> {
    await this.auditService.logAuditEvent('update', 'role', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    const { data: users, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', id)
      .limit(1);
    if (error) throw error;
    if (users?.length) {
      throw new Error('Cannot delete role with assigned users');
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'role', id, { id });
  }
}
