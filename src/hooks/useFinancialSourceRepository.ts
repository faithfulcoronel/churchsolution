import { container } from '../lib/container';
import type { IFinancialSourceRepository } from '../repositories/financialSource.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFinancialSourceRepository() {
  const repository = container.get<IFinancialSourceRepository>('IFinancialSourceRepository');
  return useBaseRepository(repository, 'Financial Source', 'financial_sources');
}