import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui2/card';
import { Button } from '../components/ui2/button';
import { Building2, DollarSign, BarChart3, Users, Plus } from 'lucide-react';

function Welcome() {
  const { hasPermission } = usePermissions();

  // Fetch the logged in member
  const { data: member } = useQuery({
    queryKey: ['current-user-member'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
  });

  // Fetch current tenant info
  const { data: tenant } = useQuery({
    queryKey: ['current-tenant-info'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const quickLinks = [
    { label: 'Church Overview', href: '/dashboard/church', icon: Building2, permission: null },
    { label: 'Donations', href: '/finances/giving', icon: DollarSign, permission: 'finance.view' },
    { label: 'Reports', href: '/finances/reports', icon: BarChart3, permission: 'finance.report' },
  ];

  const quickActions = [
    { label: 'Add Donation', href: '/finances/giving/add', icon: Plus, permission: 'finance.create' },
    { label: 'Add Member', href: '/members/add', icon: Users, permission: 'member.create' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        {member ? `Welcome back, ${member.first_name}!` : 'Welcome!'}
      </h1>

      {tenant && (
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {tenant.logo_url && (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle>{tenant.name}</CardTitle>
                <CardDescription className="capitalize">
                  Plan: {tenant.subscription_tier}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks
          .filter((q) => !q.permission || hasPermission(q.permission))
          .map((q) => (
            <Link to={q.href} key={q.label}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <q.icon className="h-6 w-6 text-primary" />
                  <span className="font-medium text-foreground">{q.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions
          .filter((a) => !a.permission || hasPermission(a.permission))
          .map((a) => (
            <Link to={a.href} key={a.label}>
              <Button variant="default" icon={<a.icon className="h-4 w-4" />}>
                {a.label}
              </Button>
            </Link>
          ))}
      </div>

      {/* Announcement / Tip */}
      <Card className="max-w-md">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Tip: Use the sidebar to quickly navigate between modules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Welcome;
