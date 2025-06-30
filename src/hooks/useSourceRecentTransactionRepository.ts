import { useQuery } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ISourceRecentTransactionRepository } from '../repositories/sourceRecentTransaction.repository';

export function useSourceRecentTransactionRepository() {
  const repo = container.get<ISourceRecentTransactionRepository>(TYPES.ISourceRecentTransactionRepository);

  const useRecentTransactions = (accountId: string, limit = 5) => {
    return useQuery({
      queryKey: ['source-transactions', accountId, limit],
      queryFn: () => repo.getRecentTransactions(accountId, limit),
      enabled: !!accountId,
    });
  };

  const useRecentTransactionsByFund = (fundId: string, limit = 5) => {
    return useQuery({
      queryKey: ['fund-transactions', fundId, limit],
      queryFn: () => repo.getRecentTransactionsByFund(fundId, limit),
      enabled: !!fundId,
    });
  };

  const useSourceBalance = (accountId: string) => {
    return useQuery({
      queryKey: ['source-balance', accountId],
      queryFn: () => repo.getBalance(accountId),
      enabled: !!accountId,
    });
  };

  return { useRecentTransactions, useRecentTransactionsByFund, useSourceBalance };
}
