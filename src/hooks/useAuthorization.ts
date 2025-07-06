import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Simple hook to check if the current user has a permission.
 * Usage: const { allowed } = useAuthorization('member.create');
 */
export function useAuthorization(permission: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['can-user', permission],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('can_user', { required_permission: permission });
      if (error) throw error;
      return data?.[0];
    },
  });

  return { allowed: Boolean(data), isLoading };
}
