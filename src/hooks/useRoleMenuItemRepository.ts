import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IRoleMenuItemRepository } from '../repositories/roleMenuItem.repository';
import { useBaseRepository } from './useBaseRepository';

export function useRoleMenuItemRepository() {
  const repository = container.get<IRoleMenuItemRepository>(TYPES.IRoleMenuItemRepository);
  return useBaseRepository(repository, 'Role Menu Item', 'role-menu-items');
}
