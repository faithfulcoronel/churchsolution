import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMessageStore } from '../components/MessageHandler';

interface QueryOptions {
  enabled?: boolean;
}

export function useFinancialReports(tenantId: string | null) {
  const { addMessage } = useMessageStore();

  const fetchReport = async (
    rpc: string,
    params: Record<string, any>
  ) => {
    const { data, error } = await supabase.rpc(rpc, params);
    if (error) {
      console.error(`Error fetching ${rpc}:`, error);
      addMessage({ type: 'error', text: `Failed to generate ${rpc.replace(/_/g,' ')}`, duration: 5000 });
      throw error;
    }
    return data || [];
  };

  const useTrialBalance = (endDate: string, options?: QueryOptions) =>
    useQuery({
      queryKey: ['trial-balance', tenantId, endDate],
      queryFn: () =>
        fetchReport('report_trial_balance', {
          p_tenant_id: tenantId,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useGeneralLedger = (
    startDate: string,
    endDate: string,
    accountId?: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['general-ledger', tenantId, startDate, endDate, accountId],
      queryFn: () =>
        fetchReport('report_general_ledger', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
          p_account_id: accountId,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useJournalReport = (
    startDate: string,
    endDate: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['journal-report', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_journal', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useIncomeStatement = (
    startDate: string,
    endDate: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['income-statement', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_income_statement', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useBudgetVsActual = (
    startDate: string,
    endDate: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['budget-vs-actual', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_budget_vs_actual', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useFundSummary = (startDate: string, endDate: string, options?: QueryOptions) =>
    useQuery({
      queryKey: ['fund-summary', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_fund_summary', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useMemberGivingSummary = (
    startDate: string,
    endDate: string,
    memberId?: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['member-giving-summary', tenantId, startDate, endDate, memberId],
      queryFn: () =>
        fetchReport('report_member_giving_summary', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
          p_member_id: memberId,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useGivingStatement = (
    startDate: string,
    endDate: string,
    memberId: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['giving-statement', tenantId, startDate, endDate, memberId],
      queryFn: () =>
        fetchReport('report_giving_statement', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
          p_member_id: memberId,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useOfferingSummary = (startDate: string, endDate: string, options?: QueryOptions) =>
    useQuery({
      queryKey: ['offering-summary', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_offering_summary', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useCategoryFinancialReport = (
    startDate: string,
    endDate: string,
    categoryId?: string,
    options?: QueryOptions
  ) =>
    useQuery({
      queryKey: ['category-financial-report', tenantId, startDate, endDate, categoryId],
      queryFn: () =>
        fetchReport('report_category_financial', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
          p_category_id: categoryId,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  const useCashFlowSummary = (startDate: string, endDate: string, options?: QueryOptions) =>
    useQuery({
      queryKey: ['cash-flow-summary', tenantId, startDate, endDate],
      queryFn: () =>
        fetchReport('report_cash_flow_summary', {
          p_tenant_id: tenantId,
          p_start_date: startDate,
          p_end_date: endDate,
        }),
      enabled: !!tenantId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
    });

  return {
    useTrialBalance,
    useGeneralLedger,
    useJournalReport,
    useIncomeStatement,
    useBudgetVsActual,
    useFundSummary,
    useMemberGivingSummary,
    useGivingStatement,
    useOfferingSummary,
    useCategoryFinancialReport,
    useCashFlowSummary,
  };
}
