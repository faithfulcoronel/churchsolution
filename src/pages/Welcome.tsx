import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui2/card';
import { Button } from '../components/ui2/button';
import { Building2, DollarSign, BarChart3, Users, Plus } from 'lucide-react';
import { QuickAccessCard, Announcements } from '../components/welcome';

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-heading font-bold text-foreground">
          {member ? `Welcome back, ${member.first_name}!` : 'Welcome!'}
        </h1>
        <p className="text-muted-foreground">
          Here's a quick overview to get you started.
        </p>
      </div>

      {tenant && (
        <Card className="max-w-md bg-muted">
          <CardHeader className="p-4">
            <div className="flex items-center space-x-4">
              {tenant.logo_url && (
                <img
                  src={tenant.logo_url}
                  alt={tenant.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-lg font-semibold">
                  {tenant.name}
                </CardTitle>
                <CardDescription className="capitalize">
                  Plan: {tenant.subscription_tier}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Quick Access */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks
            .filter((q) => !q.permission || hasPermission(q.permission))
            .map((q) => (
              <QuickAccessCard
                key={q.label}
                to={q.href}
                icon={q.icon}
                label={q.label}
              />
            ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3">
            {quickActions
              .filter((a) => !a.permission || hasPermission(a.permission))
              .map((a) => (
                <Link to={a.href} key={a.label}>
                  <Button variant="default" icon={<a.icon className="h-4 w-4" />}>
                    {a.label}
                  </Button>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Announcement / Tip */}
      <Announcements messages={[
        'Tip: Use the sidebar to quickly navigate between modules.'
      ]} />
    </div>
  );
}

export default Welcome;
