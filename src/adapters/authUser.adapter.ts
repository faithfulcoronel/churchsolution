import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { handleSupabaseError } from '../utils/supabaseErrorHandler';
import { handleError } from '../utils/errorHandler';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { TYPES } from '../lib/types';
import { AuditService } from '../services/AuditService';
import { User } from '../models/user.model';

export interface IAuthUserAdapter extends BaseAdapter<User> {}

@injectable()
export class AuthUserAdapter
  extends BaseAdapter<User>
  implements IAuthUserAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  // Fetch users for the current tenant using RPC
  public override async fetch(
    options: QueryOptions = {}
  ): Promise<{ data: User[]; count: number | null }> {
    try {
      if (options.enabled === false) {
        return { data: [], count: null };
      }

      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      const { data, error } = await supabase.rpc('get_tenant_users', {
        p_tenant_id: tenantId,
      });

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      const users = (data || []) as User[];
      return { data: users, count: users.length };
    } catch (error) {
      throw handleError(error, { context: 'authUser.fetch', options });
    }
  }

  // Fetch single user by id
  public override async fetchById(
    id: string,
    _options: Omit<QueryOptions, 'pagination'> = {}
  ): Promise<User | null> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      const { data, error } = await supabase.rpc('get_tenant_users', {
        p_tenant_id: tenantId,
      });

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      const user = (data || []).find((u: any) => u.id === id) || null;
      return user as User | null;
    } catch (error) {
      throw handleError(error, { context: 'authUser.fetchById', id });
    }
  }

  // Create a new user using handle_user_creation RPC
  public override async create(data: Partial<User>): Promise<User> {
    try {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) {
        throw new Error('No tenant context found');
      }

      const { data: created, error } = await supabase.rpc(
        'handle_user_creation',
        {
          p_email: data.email,
          p_password: data.password,
          p_tenant_id: tenantId,
          p_roles: (data as any).roles || [],
          p_first_name: (data as any).first_name || '',
          p_last_name: (data as any).last_name || '',
          p_admin_role: (data as any).admin_role || 'member',
        }
      );

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      const user = (created as any) as User;
      await this.auditService.logAuditEvent('create', 'user', user.id, user);
      return user;
    } catch (error) {
      throw handleError(error, { context: 'authUser.create', data });
    }
  }

  // Update user via manage_user RPC
  public override async update(id: string, data: Partial<User>): Promise<User> {
    try {
      const { data: updated, error } = await supabase.rpc('manage_user', {
        operation: 'update',
        target_user_id: id,
        user_data: data,
      });

      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      const user = (updated as any) as User;
      await this.auditService.logAuditEvent('update', 'user', user.id, user);
      return user;
    } catch (error) {
      throw handleError(error, { context: 'authUser.update', id, data });
    }
  }

  // Delete user via delete_user RPC
  public override async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('delete_user', { user_id: id });
      if (error) {
        handleSupabaseError(error);
        throw error;
      }

      await this.auditService.logAuditEvent('delete', 'user', id, { id });
    } catch (error) {
      throw handleError(error, { context: 'authUser.delete', id });
    }
  }
}
