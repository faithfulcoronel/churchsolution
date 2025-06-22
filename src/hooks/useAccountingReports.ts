import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMessageStore } from '../components/MessageHandler';

export function useAccountingReports() {
  const { addMessage } = useMessageStore();
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1 of current year
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  // Get trial balance
  const useTrialBalance = (asOfDate?: string) => {
    const endDate = asOfDate || dateRange.endDate;
    
    return useQuery({
      queryKey: ['trial-balance', endDate],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('generate_trial_balance', {
            p_end_date: endDate
          });
          
          if (error) throw error;
          
          // Calculate totals
          const totalDebits = data.reduce((sum, item) => sum + (item.debit_balance || 0), 0);
          const totalCredits = data.reduce((sum, item) => sum + (item.credit_balance || 0), 0);
          
          return {
            accounts: data,
            totalDebits,
            totalCredits,
            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
          };
        } catch (error) {
          console.error('Error fetching trial balance:', error);
          addMessage({
            type: 'error',
            text: 'Failed to generate trial balance',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get income statement
  const useIncomeStatement = (startDate?: string, endDate?: string) => {
    const start = startDate || dateRange.startDate;
    const end = endDate || dateRange.endDate;
    
    return useQuery({
      queryKey: ['income-statement', start, end],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('generate_income_statement', {
            p_start_date: start,
            p_end_date: end
          });
          
          if (error) throw error;
          
          // Calculate totals
          const revenues = data.filter(item => item.account_type === 'revenue');
          const expenses = data.filter(item => item.account_type === 'expense');
          
          const totalRevenue = revenues.reduce((sum, item) => sum + (item.amount || 0), 0);
          const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
          const netIncome = totalRevenue - totalExpenses;
          
          return {
            revenues,
            expenses,
            totalRevenue,
            totalExpenses,
            netIncome
          };
        } catch (error) {
          console.error('Error fetching income statement:', error);
          addMessage({
            type: 'error',
            text: 'Failed to generate income statement',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get balance sheet
  const useBalanceSheet = (asOfDate?: string) => {
    const endDate = asOfDate || dateRange.endDate;
    
    return useQuery({
      queryKey: ['balance-sheet', endDate],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('generate_balance_sheet', {
            p_end_date: endDate
          });
          
          if (error) throw error;
          
          // Organize by account type
          const assets = data.filter(item => item.account_type === 'asset');
          const liabilities = data.filter(item => item.account_type === 'liability');
          const equity = data.filter(item => item.account_type === 'equity');
          
          const totalAssets = assets.reduce((sum, item) => sum + (item.balance || 0), 0);
          const totalLiabilities = liabilities.reduce((sum, item) => sum + (item.balance || 0), 0);
          const totalEquity = equity.reduce((sum, item) => sum + (item.balance || 0), 0);
          
          return {
            assets,
            liabilities,
            equity,
            totalAssets,
            totalLiabilities,
            totalEquity,
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
          };
        } catch (error) {
          console.error('Error fetching balance sheet:', error);
          addMessage({
            type: 'error',
            text: 'Failed to generate balance sheet',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get account balance
  const useAccountBalance = (accountId: string, asOfDate?: string) => {
    const endDate = asOfDate || dateRange.endDate;
    
    return useQuery({
      queryKey: ['account-balance', accountId, endDate],
      queryFn: async () => {
        try {
          if (!accountId) return 0;
          
          const { data, error } = await supabase.rpc('get_account_balance', {
            p_account_id: accountId,
            p_end_date: endDate
          });

          if (error) throw error;
          return data?.balance ?? 0;
        } catch (error) {
          console.error(`Error fetching balance for account ${accountId}:`, error);
          addMessage({
            type: 'error',
            text: 'Failed to fetch account balance',
            duration: 5000,
          });
          throw error;
        }
      },
      enabled: !!accountId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get account transactions
  const useAccountTransactions = (accountId: string, startDate?: string, endDate?: string) => {
    const start = startDate || dateRange.startDate;
    const end = endDate || dateRange.endDate;
    
    return useQuery({
      queryKey: ['account-transactions', accountId, start, end],
      queryFn: async () => {
        try {
          if (!accountId) return [];
          
          const { data, error } = await supabase
            .from('financial_transactions')
            .select(`
              id,
              debit,
              credit,
              description,
              date,
              header:header_id(
                id,
                transaction_number,
                transaction_date,
                status
              )
            `)
            .eq('account_id', accountId)
            .gte('date', start)
            .lte('date', end)
            .is('deleted_at', null)
            .order('date', { ascending: true });
          
          if (error) throw error;
          
          return data || [];
        } catch (error) {
          console.error('Error fetching account transactions:', error);
          addMessage({
            type: 'error',
            text: 'Failed to fetch account transactions',
            duration: 5000,
          });
          throw error;
        }
      },
      enabled: !!accountId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    dateRange,
    setDateRange,
    useTrialBalance,
    useIncomeStatement,
    useBalanceSheet,
    useAccountBalance,
    useAccountTransactions
  };
}