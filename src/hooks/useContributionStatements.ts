import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMessageStore } from '../components/MessageHandler';

export function useContributionStatements() {
  const { addMessage } = useMessageStore();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const useStatements = (startDate?: string, endDate?: string) => {
    const start = startDate || dateRange.startDate;
    const end = endDate || dateRange.endDate;

    return useQuery({
      queryKey: ['member-statements', start, end],
      queryFn: async () => {
        try {
          const { data, error } = await supabase.rpc('get_member_statement', {
            p_start_date: start,
            p_end_date: end,
          });

          if (error) throw error;
          return (data || []) as {
            member_id: string;
            first_name: string;
            last_name: string;
            fund_id: string | null;
            fund_name: string | null;
            total_amount: number;
          }[];
        } catch (error) {
          console.error('Error fetching member statements:', error);
          addMessage({
            type: 'error',
            text: 'Failed to generate statements',
            duration: 5000,
          });
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    dateRange,
    setDateRange,
    useStatements,
  };
}
