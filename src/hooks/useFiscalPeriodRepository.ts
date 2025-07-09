import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFiscalPeriodRepository } from '../repositories/fiscalPeriod.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFiscalPeriodRepository() {
  const repository = container.get<IFiscalPeriodRepository>(TYPES.IFiscalPeriodRepository);
  return useBaseRepository(repository, 'Fiscal Period', 'fiscal_period');
}
