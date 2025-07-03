import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

function DashboardHeader() {
  const { user } = useAuthStore();
  const { data: member } = useQuery({
    queryKey: ['dashboard-header-member', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('members')
        .select('first_name')
        .eq('email', user.email)
        .is('deleted_at', null)
        .single();
      if (error) {
        console.error('Error fetching member data:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.email,
  });

  const userName = member?.first_name || user?.email || 'User';

  return (
    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h2>
  );
}

export default DashboardHeader;
