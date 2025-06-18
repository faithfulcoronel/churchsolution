import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ChartOfAccount } from '../models/chartOfAccount.model';
import { useMessageStore } from '../components/MessageHandler';

export function useChartOfAccounts() {
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();

  // Get all accounts
  const useAccounts = (options: { hierarchical?: boolean } = {}) => {
    const { hierarchical = false } = options;
    
    return useQuery({
      queryKey: ['chart-of-accounts', { hierarchical }],
      queryFn: async () => {
        try {
          if (hierarchical) {
            const { data, error } = await supabase.rpc('get_chart_of_accounts_hierarchy');
            if (error) throw error;
            return data;
          } else {
            const { data, error } = await supabase
              .from('chart_of_accounts')
              .select(`
                id,
                code,
                name,
                description,
                account_type,
                account_subtype,
                is_active,
                parent_id,
                parent:chart_of_accounts(id, code, name)
              `)
              .is('deleted_at', null)
              .order('code', { ascending: true });
            
            if (error) throw error;
            return data;
          }
        } catch (error) {
          console.error('Error fetching chart of accounts:', error);
          addMessage({
            type: 'error',
            text: 'Failed to fetch chart of accounts',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get account by ID
  const useAccount = (id: string) => {
    return useQuery({
      queryKey: ['chart-of-accounts', id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('chart_of_accounts')
            .select(`
              id,
              code,
              name,
              description,
              account_type,
              account_subtype,
              is_active,
              parent_id,
              parent:chart_of_accounts(id, code, name)
            `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error(`Error fetching account ${id}:`, error);
          addMessage({
            type: 'error',
            text: 'Failed to fetch account details',
            duration: 5000,
          });
          throw error;
        }
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create account
  const useCreateAccount = () => {
    return useMutation({
      mutationFn: async (account: Partial<ChartOfAccount>) => {
        try {
          const { data, error } = await supabase
            .from('chart_of_accounts')
            .insert([account])
            .select()
            .single();
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Error creating account:', error);
          addMessage({
            type: 'error',
            text: 'Failed to create account',
            duration: 5000,
          });
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        addMessage({
          type: 'success',
          text: 'Account created successfully',
          duration: 3000,
        });
      }
    });
  };

  // Update account
  const useUpdateAccount = () => {
    return useMutation({
      mutationFn: async ({ id, ...account }: Partial<ChartOfAccount> & { id: string }) => {
        try {
          const { data, error } = await supabase
            .from('chart_of_accounts')
            .update(account)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error(`Error updating account ${id}:`, error);
          addMessage({
            type: 'error',
            text: 'Failed to update account',
            duration: 5000,
          });
          throw error;
        }
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', data.id] });
        addMessage({
          type: 'success',
          text: 'Account updated successfully',
          duration: 3000,
        });
      }
    });
  };

  // Delete account
  const useDeleteAccount = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        try {
          // Check if account has transactions
          const { count: transactionCount, error: countError } = await supabase
            .from('financial_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', id);
          
          if (countError) throw countError;
          
          if (transactionCount && transactionCount > 0) {
            throw new Error('Cannot delete account with existing transactions');
          }
          
          // Check if account has children
          const { count: childrenCount, error: childrenError } = await supabase
            .from('chart_of_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', id);
          
          if (childrenError) throw childrenError;
          
          if (childrenCount && childrenCount > 0) {
            throw new Error('Cannot delete account with child accounts');
          }
          
          // Soft delete the account
          const { error } = await supabase
            .from('chart_of_accounts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
          
          if (error) throw error;
          return id;
        } catch (error) {
          console.error(`Error deleting account ${id}:`, error);
          addMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to delete account',
            duration: 5000,
          });
          throw error;
        }
      },
      onSuccess: (id) => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', id] });
        addMessage({
          type: 'success',
          text: 'Account deleted successfully',
          duration: 3000,
        });
      }
    });
  };

  // Get account balance
  const useAccountBalance = (accountId: string, asOfDate?: string) => {
    return useQuery({
      queryKey: ['account-balance', accountId, asOfDate],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('get_account_balance', {
            p_account_id: accountId,
            p_end_date: asOfDate || new Date().toISOString().split('T')[0]
          });
          
          if (error) throw error;
          return data;
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

  // Get accounts as options for select inputs
  const useAccountOptions = (accountType?: string | string[]) => {
    return useQuery({
      queryKey: ['chart-of-accounts-options', accountType],
      queryFn: async () => {
        try {
          let query = supabase
            .from('chart_of_accounts')
            .select('id, code, name, account_type')
            .is('deleted_at', null)
            .eq('is_active', true);
          
          if (accountType) {
            if (Array.isArray(accountType)) {
              query = query.in('account_type', accountType);
            } else {
              query = query.eq('account_type', accountType);
            }
          }
          
          const { data, error } = await query.order('code', { ascending: true });
          
          if (error) throw error;
          
          return data.map(account => ({
            value: account.id,
            label: `${account.code} - ${account.name}`,
            type: account.account_type
          }));
        } catch (error) {
          console.error('Error fetching account options:', error);
          addMessage({
            type: 'error',
            text: 'Failed to fetch account options',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    useAccounts,
    useAccount,
    useCreateAccount,
    useUpdateAccount,
    useDeleteAccount,
    useAccountBalance,
    useAccountOptions
  };
}