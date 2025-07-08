import { Role } from '../models/role.model';
import type { IRoleRepository } from '../repositories/role.repository';
import { supabase } from '../lib/supabase';

export class RoleValidator {
  static async validate(
    data: Partial<Role>,
    repository?: IRoleRepository,
    currentId?: string
  ): Promise<void> {
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Role name is required');
    }

    if (repository && data.name) {
      const { data: existing } = await repository.find({
        filters: {
          name: { operator: 'eq', value: data.name.trim().toLowerCase() },
          ...(currentId
            ? { id: { operator: 'neq', value: currentId } }
            : {}),
        },
        pagination: { page: 1, pageSize: 1 },
      });
      if (existing.length) {
        throw new Error('A role with this name already exists');
      }
    }

    const permissionIds = (data as any).permissionIds as string[] | undefined;
    if (permissionIds && permissionIds.length) {
      const { data: perms, error } = await supabase
        .from('permissions')
        .select('id')
        .in('id', permissionIds);

      if (error) throw error;
      const found = perms?.map((p) => p.id) || [];
      if (found.length !== permissionIds.length) {
        throw new Error('Invalid permission ids');
      }
    }
  }
}
