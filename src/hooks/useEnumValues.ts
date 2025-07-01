import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useEnumValues() {
  const { data: membershipTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['enum-membership-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_type')
        .select('code');

      if (error) throw error;
      return (data as { code: string }[]).map((row) => row.code);
    }
  });

  const { data: memberStatuses, isLoading: statusesLoading } = useQuery({
    queryKey: ['enum-member-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_status')
        .select('code');

      if (error) throw error;
      return (data as { code: string }[]).map((row) => row.code);
    }
  });

  const formatEnumValue = (value: string) => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return {
    membershipTypes: membershipTypes?.map(type => ({
      value: type,
      label: formatEnumValue(type)
    })) || [],
    memberStatuses: memberStatuses?.map(status => ({
      value: status,
      label: formatEnumValue(status)
    })) || [],
    isLoading: typesLoading || statusesLoading
  };
}