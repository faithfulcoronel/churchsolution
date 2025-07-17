import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseWrapper } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export function useNotificationListener() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();
    supabaseWrapper.addSubscription(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient]);
}
