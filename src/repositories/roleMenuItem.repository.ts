import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { RoleMenuItem } from '../models/roleMenuItem.model';
import type { IRoleMenuItemAdapter } from '../adapters/roleMenuItem.adapter';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { handleSupabaseError } from '../utils/supabaseErrorHandler';
import { handleError } from '../utils/errorHandler';

export interface IRoleMenuItemRepository extends BaseRepository<RoleMenuItem> {
  replaceRoleMenuItems(roleId: string, menuItemIds: string[]): Promise<void>;
}

@injectable()
export class RoleMenuItemRepository
  extends BaseRepository<RoleMenuItem>
  implements IRoleMenuItemRepository
{
  constructor(@inject(TYPES.IRoleMenuItemAdapter) adapter: IRoleMenuItemAdapter) {
    super(adapter);
  }

  async replaceRoleMenuItems(
    roleId: string,
    menuItemIds: string[]
  ): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    try {
      const { error: deleteError } = await supabase
        .from('role_menu_items')
        .delete()
        .eq('role_id', roleId)
        .eq('tenant_id', tenantId);

      if (deleteError) handleSupabaseError(deleteError);

      if (menuItemIds.length) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const rows = menuItemIds.map(mid => ({
          role_id: roleId,
          menu_item_id: mid,
          tenant_id: tenantId,
          created_by: userId,
          created_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('role_menu_items')
          .insert(rows);

        if (insertError) handleSupabaseError(insertError);
      }
    } catch (error) {
      throw handleError(error, {
        context: 'replaceRoleMenuItems',
        roleId,
        menuItemIds,
      });
    }
  }
}
