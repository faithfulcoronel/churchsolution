import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFiscalYearRepository } from '../repositories/fiscalYear.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFiscalYearRepository() {
  const repository = container.get<IFiscalYearRepository>(TYPES.IFiscalYearRepository);
  return useBaseRepository(repository, 'Fiscal Year', 'fiscal_year');
}
