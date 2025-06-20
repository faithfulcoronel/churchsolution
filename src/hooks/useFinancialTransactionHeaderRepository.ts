import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import { useBaseRepository } from './useBaseRepository';

export function useFinancialTransactionHeaderRepository() {
  const repository = container.get<IFinancialTransactionHeaderRepository>(TYPES.IFinancialTransactionHeaderRepository);
  return {
    ...useBaseRepository(repository, 'Transaction', 'financial_transaction_headers'),
    postTransaction: async (id: string) => {
      return repository.postTransaction(id);
    },
    voidTransaction: async (id: string, reason: string) => {
      return repository.voidTransaction(id, reason);
    },
    getTransactionEntries: async (headerId: string) => {
      return repository.getTransactionEntries(headerId);
    },
    isTransactionBalanced: async (headerId: string) => {
      return repository.isTransactionBalanced(headerId);
    }
  };
}