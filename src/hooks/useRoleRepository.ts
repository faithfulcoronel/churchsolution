import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IRoleRepository } from '../repositories/role.repository';
import { useBaseRepository } from './useBaseRepository';

export function useRoleRepository() {
  const repository = container.get<IRoleRepository>(TYPES.IRoleRepository);
  return useBaseRepository(repository, 'Role', 'roles');
}
