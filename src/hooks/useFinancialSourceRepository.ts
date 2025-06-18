import { container } from '../lib/container';
import { FinancialSourceRepository } from '../repositories/financialSource.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFinancialSourceRepository() {
  const repository = container.get(FinancialSourceRepository);
  return useBaseRepository(repository, 'Financial Source', 'financial_sources');
}