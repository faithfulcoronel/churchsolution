import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IIncomeExpenseTransactionRepository } from '../repositories/incomeExpenseTransaction.repository';
import { useBaseRepository } from './useBaseRepository';
import { useCallback } from 'react';

export function useIncomeExpenseTransactionRepository() {
  const repository = container.get<IIncomeExpenseTransactionRepository>(TYPES.IIncomeExpenseTransactionRepository);
  const base = useBaseRepository(repository, 'Transaction', 'income_expense_transactions');

  const getByHeaderId = useCallback(
    async (headerId: string) => repository.getByHeaderId(headerId),
    [repository]
  );

  return { ...base, getByHeaderId };
}
