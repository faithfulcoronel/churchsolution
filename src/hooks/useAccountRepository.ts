import { container } from '../lib/container';
import { AccountRepository } from '../repositories/account.repository';
import { useBaseRepository } from './useBaseRepository';

export function useAccountRepository() {
  const repository = container.get(AccountRepository);
  return useBaseRepository(repository, 'Account', 'accounts');
}