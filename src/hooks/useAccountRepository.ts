import { container } from '../lib/container';
import type { IAccountRepository } from '../repositories/account.repository';
import { useBaseRepository } from './useBaseRepository';

export function useAccountRepository() {
  const repository = container.get<IAccountRepository>('IAccountRepository');
  return useBaseRepository(repository, 'Account', 'accounts');
}