import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import { useBaseRepository } from './useBaseRepository';
import { useCallback } from 'react';

export function useFinancialTransactionHeaderRepository() {
  const repository = container.get<IFinancialTransactionHeaderRepository>(TYPES.IFinancialTransactionHeaderRepository);
  const postTransaction = useCallback(
    async (id: string) => repository.postTransaction(id),
    [repository]
  );

  const submitTransaction = useCallback(
    async (id: string) => repository.submitTransaction(id),
    [repository]
  );

  const approveTransaction = useCallback(
    async (id: string) => repository.approveTransaction(id),
    [repository]
  );

  const voidTransaction = useCallback(
    async (id: string, reason: string) => repository.voidTransaction(id, reason),
    [repository]
  );

  const getTransactionEntries = useCallback(
    async (headerId: string) => repository.getTransactionEntries(headerId),
    [repository]
  );

  const isTransactionBalanced = useCallback(
    async (headerId: string) => repository.isTransactionBalanced(headerId),
    [repository]
  );

  return {
    ...useBaseRepository(repository, 'Transaction', 'financial_transaction_headers'),
    postTransaction,
    submitTransaction,
    approveTransaction,
    voidTransaction,
    getTransactionEntries,
    isTransactionBalanced
  };
}