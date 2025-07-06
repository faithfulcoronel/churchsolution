import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMenuPermissionRepository } from '../repositories/menuPermission.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMenuPermissionRepository() {
  const repository = container.get<IMenuPermissionRepository>(TYPES.IMenuPermissionRepository);
  return useBaseRepository(repository, 'Menu Permission', 'menu-permissions');
}
