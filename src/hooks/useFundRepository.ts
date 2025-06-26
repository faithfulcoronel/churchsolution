import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFundRepository } from '../repositories/fund.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFundRepository() {
  const repository = container.get<IFundRepository>(TYPES.IFundRepository);
  return useBaseRepository(repository, 'Fund', 'funds');
}
