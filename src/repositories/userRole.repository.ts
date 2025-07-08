import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { UserRole } from '../models/userRole.model';
import type { IUserRoleAdapter } from '../adapters/userRole.adapter';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { handleSupabaseError } from '../utils/supabaseErrorHandler';
import { handleError } from '../utils/errorHandler';

export interface IUserRoleRepository extends BaseRepository<UserRole> {
  replaceUserRoles(userId: string, roleIds: string[]): Promise<void>;
}

@injectable()
export class UserRoleRepository
  extends BaseRepository<UserRole>
  implements IUserRoleRepository
{
  constructor(@inject(TYPES.IUserRoleAdapter) adapter: IUserRoleAdapter) {
    super(adapter);
  }

  async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) {
      throw new Error('No tenant context found');
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (deleteError) handleSupabaseError(deleteError);

      if (roleIds.length) {
        const currentUser = (await supabase.auth.getUser()).data.user?.id;
        const rows = roleIds.map(rid => ({
          user_id: userId,
          role_id: rid,
          tenant_id: tenantId,
          created_by: currentUser,
          created_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(rows);

        if (insertError) handleSupabaseError(insertError);
      }
    } catch (error) {
      throw handleError(error, { context: 'replaceUserRoles', userId, roleIds });
    }
  }
}
