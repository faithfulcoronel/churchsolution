import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMessageStore } from '../components/MessageHandler';

export interface JournalEntryLine {
  account_id: string;
  description?: string;
  debit?: number;
  credit?: number;
}

export interface JournalEntry {
  date: string;
  description: string;
  reference?: string;
  entries: JournalEntryLine[];
}

export function useJournalEntry() {
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();

  // Create journal entry
  const useCreateJournalEntry = () => {
    return useMutation({
      mutationFn: async (journalEntry: JournalEntry) => {
        try {
          // Validate entries
          if (!journalEntry.entries || journalEntry.entries.length === 0) {
            throw new Error('At least one journal entry line is required');
          }
          
          // Validate each entry has either debit or credit but not both
          for (const entry of journalEntry.entries) {
            if ((entry.debit && entry.credit) || (!entry.debit && !entry.credit)) {
              throw new Error('Each entry must have either a debit or credit amount, but not both');
            }
          }
          
          // Calculate totals to ensure balanced
          const totalDebits = journalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
          const totalCredits = journalEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
          
          if (Math.abs(totalDebits - totalCredits) > 0.01) {
            throw new Error(`Journal entry is not balanced. Debits (${totalDebits}) must equal credits (${totalCredits})`);
          }
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          // Get current tenant
          const { data: tenantData, error: tenantError } = await supabase.rpc('get_current_tenant');
          if (tenantError) throw tenantError;
          if (!tenantData || tenantData.length === 0) throw new Error('No tenant found');
          
          const tenantId = tenantData[0].id;
          
          // Create journal entry
          const { data, error } = await supabase.rpc('create_journal_entry', {
            p_tenant_id: tenantId,
            p_user_id: user.id,
            p_date: journalEntry.date,
            p_description: journalEntry.description,
            p_reference: journalEntry.reference || null,
            p_entries: JSON.stringify(journalEntry.entries)
          });
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Error creating journal entry:', error);
          addMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to create journal entry',
            duration: 5000,
          });
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        queryClient.invalidateQueries({ queryKey: ['account-balance'] });
        addMessage({
          type: 'success',
          text: 'Journal entry created successfully',
          duration: 3000,
        });
      }
    });
  };

  // Post journal entry
  const usePostJournalEntry = () => {
    return useMutation({
      mutationFn: async (headerId: string) => {
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          // Post the journal entry
          const { data, error } = await supabase.rpc('post_transaction', {
            p_header_id: headerId,
            p_user_id: user.id
          });
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Error posting journal entry:', error);
          addMessage({
            type: 'error',
            text: error instanceof Error ? error.message : 'Failed to post journal entry',
            duration: 5000,
          });
          throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_transaction_headers'] });
        queryClient.invalidateQueries({ queryKey: ['account-balance'] });
        addMessage({
          type: 'success',
          text: 'Journal entry posted successfully',
          duration: 3000,
        });
      }
    });
  };

  return {
    useCreateJournalEntry,
    usePostJournalEntry
  };
}