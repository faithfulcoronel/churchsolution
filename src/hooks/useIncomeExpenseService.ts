import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import type { TransactionType } from '../models/financialTransaction.model';
import { IncomeExpenseTransactionService, IncomeExpenseEntry } from '../services/IncomeExpenseTransactionService';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

export interface IncomeExpenseEntryBase
  extends Omit<IncomeExpenseEntry, 'transaction_type'> {
  isDirty?: boolean;
  isDeleted?: boolean;
}

export function useIncomeExpenseService(transactionType: TransactionType) {
  const service = container.get<IncomeExpenseTransactionService>(TYPES.IncomeExpenseTransactionService);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ header, entries }: { header: Partial<FinancialTransactionHeader>; entries: IncomeExpenseEntryBase[] }) =>
      service.create(header, entries.map(e => ({ ...e, transaction_type: transactionType }))),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        queryClient.invalidateQueries({ queryKey: ['income_expense_transactions'] });
        NotificationService.showSuccess('Transaction created successfully');
      },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, header, entries }: { id: string; header: Partial<FinancialTransactionHeader>; entries: IncomeExpenseEntryBase[] }) =>
      service.updateBatch(id, header, entries.map(e => ({ ...e, transaction_type: transactionType }))),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        queryClient.invalidateQueries({ queryKey: ['income_expense_transactions'] });
        NotificationService.showSuccess('Transaction updated successfully');
      },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_transactions'] });
      NotificationService.showSuccess('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => service.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      queryClient.invalidateQueries({ queryKey: ['income_expense_transactions'] });
      NotificationService.showSuccess('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const createBatch = async (
    header: Partial<FinancialTransactionHeader>,
    entries: IncomeExpenseEntryBase[],
  ) => createMutation.mutateAsync({ header, entries });

  const updateBatch = async (
    id: string,
    header: Partial<FinancialTransactionHeader>,
    entries: IncomeExpenseEntryBase[],
  ) => updateMutation.mutateAsync({ id, header, entries });

  const deleteTransaction = async (id: string) => deleteMutation.mutateAsync(id);

  const deleteBatch = async (id: string) => deleteBatchMutation.mutateAsync(id);
  return {
    createBatch,
    updateBatch,
    deleteTransaction,
    deleteBatch,
    createMutation,
    updateMutation,
    deleteMutation,
    deleteBatchMutation,
  };
}
