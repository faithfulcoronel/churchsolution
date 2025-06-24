import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { GivingService, GivingLine } from '../services/GivingService';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../services/NotificationService';

export interface ContributionEntry extends GivingLine {}

export function useGivingService() {
  const service = container.get<GivingService>(TYPES.GivingService);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ header, contributions }: { header: Partial<FinancialTransactionHeader>; contributions: ContributionEntry[] }) =>
      service.createGivingBatch(header, contributions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      NotificationService.showSuccess('Transaction created successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, header, contributions }: { id: string; header: Partial<FinancialTransactionHeader>; contributions: ContributionEntry[] }) =>
      service.updateGivingBatch(id, header, contributions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
      NotificationService.showSuccess('Transaction updated successfully');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    }
  });

  const createGivingBatch = async (
    header: Partial<FinancialTransactionHeader>,
    contributions: ContributionEntry[],
  ) => createMutation.mutateAsync({ header, contributions });

  const updateGivingBatch = async (
    id: string,
    header: Partial<FinancialTransactionHeader>,
    contributions: ContributionEntry[],
  ) => updateMutation.mutateAsync({ id, header, contributions });

  return { createGivingBatch, updateGivingBatch, createMutation, updateMutation };
}
