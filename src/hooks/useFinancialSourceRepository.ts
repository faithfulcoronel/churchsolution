import { container, TYPES } from '../lib/container';
import type { IFinancialSourceRepository } from '../repositories/financialSource.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFinancialSourceRepository() {
  const repository = container.get<IFinancialSourceRepository>(TYPES.IFinancialSourceRepository);
  return useBaseRepository(repository, 'Financial Source', 'financial_sources');
}