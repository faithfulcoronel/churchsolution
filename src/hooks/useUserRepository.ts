import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IUserRepository } from '../repositories/user.repository';
import { useBaseRepository } from './useBaseRepository';

export function useUserRepository() {
  const repository = container.get<IUserRepository>(TYPES.IUserRepository);
  return useBaseRepository(repository, 'User', 'users');
}
