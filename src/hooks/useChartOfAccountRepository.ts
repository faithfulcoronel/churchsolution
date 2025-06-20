import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IChartOfAccountRepository } from '../repositories/chartOfAccount.repository';
import { useBaseRepository } from './useBaseRepository';

export function useChartOfAccountRepository() {
  const repository = container.get<IChartOfAccountRepository>(TYPES.IChartOfAccountRepository);
  return {
    ...useBaseRepository(repository, 'Chart of Account', 'chart_of_accounts'),
    getHierarchy: async () => {
      return repository.getHierarchy();
    }
  };
}