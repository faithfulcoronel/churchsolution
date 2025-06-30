import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IPermissionRepository } from '../repositories/permission.repository';
import { useBaseRepository } from './useBaseRepository';

export function usePermissionRepository() {
  const repository = container.get<IPermissionRepository>(TYPES.IPermissionRepository);
  return useBaseRepository(repository, 'Permission', 'permissions');
}
