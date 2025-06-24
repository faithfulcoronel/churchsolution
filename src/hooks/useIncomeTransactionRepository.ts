import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IIncomeTransactionRepository } from '../repositories/incomeTransaction.repository';
import { useBaseRepository } from './useBaseRepository';

export function useIncomeTransactionRepository() {
  const repository = container.get<IIncomeTransactionRepository>(TYPES.IIncomeTransactionRepository);
  return useBaseRepository(repository, 'Income Transaction', 'income_transactions');
}
