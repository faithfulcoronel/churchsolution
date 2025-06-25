import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { IncomeExpenseTransactionService, IncomeExpenseEntry } from '../services/IncomeExpenseTransactionService';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

export interface ExpenseEntry extends Omit<IncomeExpenseEntry, 'transaction_type'> {}

export function useExpenseService() {
  const service = container.get<IncomeExpenseTransactionService>(TYPES.IncomeExpenseTransactionService);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ header, expenses }: { header: Partial<FinancialTransactionHeader>; expenses: ExpenseEntry[] }) =>
      service.create(header, expenses.map(e => ({ ...e, transaction_type: 'expense' }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      NotificationService.showSuccess('Transaction created successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, header, expenses }: { id: string; header: Partial<FinancialTransactionHeader>; expenses: ExpenseEntry[] }) =>
      service.update(id, header, expenses.map(e => ({ ...e, transaction_type: 'expense' }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      NotificationService.showSuccess('Transaction updated successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    },
  });

  const createExpenseBatch = async (
    header: Partial<FinancialTransactionHeader>,
    expenses: ExpenseEntry[],
  ) => createMutation.mutateAsync({ header, expenses });

  const updateExpenseBatch = async (
    id: string,
    header: Partial<FinancialTransactionHeader>,
    expenses: ExpenseEntry[],
  ) => updateMutation.mutateAsync({ id, header, expenses });

  return { createExpenseBatch, updateExpenseBatch, createMutation, updateMutation };
}
