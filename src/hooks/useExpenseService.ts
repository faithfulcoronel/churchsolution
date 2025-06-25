import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { ExpenseService, ExpenseLine } from '../services/ExpenseService';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

export interface ExpenseEntry extends ExpenseLine {}

export function useExpenseService() {
  const service = container.get<ExpenseService>(TYPES.ExpenseService);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ header, expenses }: { header: Partial<FinancialTransactionHeader>; expenses: ExpenseEntry[] }) =>
      service.createExpenseBatch(header, expenses),
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
      service.updateExpenseBatch(id, header, expenses),
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
