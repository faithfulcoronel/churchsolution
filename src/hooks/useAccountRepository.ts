import { container, TYPES } from '../lib/container';
import type { IAccountRepository } from '../repositories/account.repository';
import { useBaseRepository } from './useBaseRepository';

export function useAccountRepository() {
  const repository = container.get<IAccountRepository>(TYPES.IAccountRepository);
  return useBaseRepository(repository, 'Account', 'accounts');
}