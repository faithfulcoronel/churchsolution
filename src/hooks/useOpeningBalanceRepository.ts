import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IOpeningBalanceRepository } from '../repositories/openingBalance.repository';
import { useBaseRepository } from './useBaseRepository';

export function useOpeningBalanceRepository() {
  const repository = container.get<IOpeningBalanceRepository>(TYPES.IOpeningBalanceRepository);
  return useBaseRepository(repository, 'Opening Balance', 'opening_balance');
}
