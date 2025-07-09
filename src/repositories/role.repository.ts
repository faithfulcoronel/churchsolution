import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Role } from '../models/role.model';
import type { IRoleAdapter } from '../adapters/role.adapter';
import { NotificationService } from '../services/NotificationService';
import { RoleValidator } from '../validators/role.validator';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { handleSupabaseError } from '../utils/supabaseErrorHandler';
import { handleError } from '../utils/errorHandler';

export interface IRoleRepository extends BaseRepository<Role> {
  updateRolePermissions(id: string, permissionIds: string[]): Promise<void>;
}

@injectable()
export class RoleRepository
  extends BaseRepository<Role>
  implements IRoleRepository
{
  constructor(@inject('IRoleAdapter') adapter: IRoleAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<Role>
  ): Promise<Partial<Role>> {
    await RoleValidator.validate(data, this);
    return this.formatData(data);
  }

  protected override async afterCreate(data: Role): Promise<void> {
    NotificationService.showSuccess(`Role "${data.name}" created successfully`);
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<Role>
  ): Promise<Partial<Role>> {
    await RoleValidator.validate(data, this, id);
    return this.formatData(data);
  }

  protected override async afterUpdate(data: Role): Promise<void> {
    NotificationService.showSuccess(`Role "${data.name}" updated successfully`);
  }

  private formatData(data: Partial<Role>): Partial<Role> {
    return {
      ...data,
      name: data.name?.trim().toLowerCase(),
      description: data.description?.trim() || null
    };
  }

  async updateRolePermissions(id: string, permissionIds: string[]): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    try {
      // Lookup menu items linked to the given permissions
      const { data: menuRows, error: menuErr } = await supabase
        .from('menu_permissions')
        .select('menu_item_id')
        .in('permission_id', permissionIds)
        .eq('tenant_id', tenantId);

      if (menuErr) handleSupabaseError(menuErr);

      const menuItemIds = Array.from(
        new Set((menuRows || []).map(m => m.menu_item_id))
      );

      const { error: deleteError } = await supabase
        .from('role_menu_items')
        .delete()
        .eq('role_id', id)
        .eq('tenant_id', tenantId);

      if (deleteError) handleSupabaseError(deleteError);

      if (menuItemIds.length) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const rows = menuItemIds.map(mid => ({
          role_id: id,
          menu_item_id: mid,
          tenant_id: tenantId,
          created_by: userId,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('role_menu_items')
          .insert(rows);

        if (insertError) handleSupabaseError(insertError);
      }
    } catch (error) {
      throw handleError(error, {
        context: 'updateRolePermissions',
        id,
        permissionIds,
      });
    }
  }
}
