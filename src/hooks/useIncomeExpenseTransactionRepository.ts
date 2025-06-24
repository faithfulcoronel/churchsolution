import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IIncomeExpenseTransactionRepository } from '../repositories/incomeExpenseTransaction.repository';
import { useBaseRepository } from './useBaseRepository';

export function useIncomeExpenseTransactionRepository() {
  const repository = container.get<IIncomeExpenseTransactionRepository>(TYPES.IIncomeExpenseTransactionRepository);
  return useBaseRepository(repository, 'Transaction', 'income_expense_transactions');
}
