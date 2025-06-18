import { container } from '../lib/container';
import { ChartOfAccountRepository } from '../repositories/chartOfAccount.repository';
import { useBaseRepository } from './useBaseRepository';

export function useChartOfAccountRepository() {
  const repository = container.get(ChartOfAccountRepository);
  return {
    ...useBaseRepository(repository, 'Chart of Account', 'chart_of_accounts'),
    getHierarchy: async () => {
      return repository.getHierarchy();
    }
  };
}