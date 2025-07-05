import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserMember } from '../utils/memberUtils';
import { useAuthStore } from '../stores/authStore';

function DashboardHeader() {
  const { user } = useAuthStore();
  const { data: member } = useQuery({
    queryKey: ['dashboard-header-member', user?.id],
    queryFn: getCurrentUserMember,
    enabled: !!user?.id,
  });

  const userName = member?.first_name || user?.email || 'User';

  return (
    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h2>
  );
}

export default DashboardHeader;
