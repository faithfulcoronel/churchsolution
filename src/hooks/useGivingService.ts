import { useFinancialTransactionHeaderRepository } from './useFinancialTransactionHeaderRepository';
import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';

export interface ContributionEntry {
  member_id: string | null;
  fund_id: string | null;
  category_id: string | null;
  source_id: string | null;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
}

export function useGivingService() {
  const { useCreateWithTransactions, useUpdateWithTransactions } =
    useFinancialTransactionHeaderRepository();

  const createMutation = useCreateWithTransactions();
  const updateMutation = useUpdateWithTransactions();

  const buildTransactions = (
    header: Partial<FinancialTransactionHeader>,
    contributions: ContributionEntry[],
  ) => {
    return contributions.flatMap((c) => {
      const base = {
        member_id: c.member_id,
        fund_id: c.fund_id,
        source_id: c.source_id,
        category_id: c.category_id,
        date: header.transaction_date!,
        description: header.description || '',
      };
      return [
        {
          ...base,
          account_id: c.source_account_id,
          debit: c.amount,
          credit: 0,
        },
        {
          ...base,
          account_id: c.category_account_id,
          debit: 0,
          credit: c.amount,
        },
      ];
    });
  };

  const createGivingBatch = async (
    header: Partial<FinancialTransactionHeader>,
    contributions: ContributionEntry[],
  ) => {
    const transactions = buildTransactions(header, contributions);
    return createMutation.mutateAsync({ data: header, transactions });
  };

  const updateGivingBatch = async (
    id: string,
    header: Partial<FinancialTransactionHeader>,
    contributions: ContributionEntry[],
  ) => {
    const transactions = buildTransactions(header, contributions);
    return updateMutation.mutateAsync({ id, data: header, transactions });
  };

  return { createGivingBatch, updateGivingBatch, createMutation, updateMutation };
}
