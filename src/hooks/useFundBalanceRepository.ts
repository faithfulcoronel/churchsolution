import { useQuery } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IFundBalanceRepository } from '../repositories/fundBalance.repository';

export function useFundBalanceRepository() {
  const repo = container.get<IFundBalanceRepository>(TYPES.IFundBalanceRepository);

  const useBalance = (fundId: string) => {
    return useQuery({
      queryKey: ['fund-balance', fundId],
      queryFn: () => repo.getBalance(fundId),
      enabled: !!fundId,
    });
  };

  return { useBalance };
}
