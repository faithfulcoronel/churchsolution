import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import { useBaseRepository } from './useBaseRepository';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

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

  const queryClient = useQueryClient();
  const base = useBaseRepository(
    repository,
    'Transaction',
    'financial_transaction_headers',
  );

  const useCreateWithTransactions = () => {
    return useMutation({
      mutationFn: ({ data, transactions }: { data: any; transactions: any[] }) =>
        repository.createWithTransactions(data, transactions),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        NotificationService.showSuccess('Transaction created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useUpdateWithTransactions = () => {
    return useMutation({
      mutationFn: ({ id, data, transactions }: { id: string; data: any; transactions: any[] }) =>
        repository.updateWithTransactions(id, data, transactions),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        NotificationService.showSuccess('Transaction updated successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  return {
    ...base,
    postTransaction,
    submitTransaction,
    approveTransaction,
    voidTransaction,
    getTransactionEntries,
    isTransactionBalanced,
    useCreateWithTransactions,
    useUpdateWithTransactions,
  };
}