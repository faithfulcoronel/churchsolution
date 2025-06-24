import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ICategoryRepository } from '../repositories/category.repository';
import { useBaseRepository } from './useBaseRepository';

export function useCategoryRepository() {
  const repository = container.get<ICategoryRepository>(TYPES.ICategoryRepository);
  return useBaseRepository(repository, 'Category', 'categories');
}
