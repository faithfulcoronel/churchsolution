import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMenuItemRepository } from '../repositories/menuItem.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMenuItemRepository() {
  const repository = container.get<IMenuItemRepository>(TYPES.IMenuItemRepository);
  return useBaseRepository(repository, 'Menu Item', 'menu-items');
}
