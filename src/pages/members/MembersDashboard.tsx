import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { tenantUtils } from '../../utils/tenantUtils';
import { startOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Container } from '../../components/ui2/container';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui2/tabs';

interface MemberSummary {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  created_at: string | null;
}

function MembersDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const { data: tenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const { data: visitorStatus } = useQuery({
    queryKey: ['visitor-status', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      const { data, error } = await supabase
        .from('membership_status')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('code', 'visitor')
        .maybeSingle();
      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!tenant?.id,
  });

  const { data: totalMembers } = useQuery({
    queryKey: ['total-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .is('deleted_at', null);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id,
  });

  const { data: newMembers } = useQuery({
    queryKey: ['new-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const start = startOfMonth(new Date());
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .gte('created_at', start.toISOString())
        .is('deleted_at', null);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id,
  });

  const { data: visitorCount } = useQuery({
    queryKey: ['visitor-count', tenant?.id, visitorStatus],
    queryFn: async () => {
      if (!tenant?.id || !visitorStatus) return 0;
      const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('status_category_id', visitorStatus)
        .is('deleted_at', null);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id && !!visitorStatus,
  });

  const { data: familyCount } = useQuery({
    queryKey: ['family-count', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const { count, error } = await supabase
        .from('family_relationships')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id,
  });

  const { data: recentMembers } = useQuery({
    queryKey: ['recent-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [] as MemberSummary[];
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, profile_picture_url, created_at')
        .eq('tenant_id', tenant.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []) as MemberSummary[];
    },
    enabled: !!tenant?.id,
  });

  const highlights = [
    { name: 'Total Members', value: totalMembers || 0, icon: Users },
    { name: 'New This Month', value: newMembers || 0, icon: UserPlus },
    { name: 'Visitors', value: visitorCount || 0, icon: UserCheck },
    { name: 'Families', value: familyCount || 0, icon: Heart },
  ];

  const actions = [
    {
      label: 'New Member',
      href: '/members/add',
      icon: UserPlus,
    },
    {
      label: 'New Family',
      href: '/members/family/add',
      icon: Heart,
    },
    {
      label: 'Member Settings',
      href: '/members/configuration/membership-types',
      icon: SettingsIcon,
    },
  ];

  return (
    <Container className="space-y-6 max-w-[1200px]" size="xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Members</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Overview of your church membership records.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <Card key={h.name}>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-2 rounded-md bg-primary/10">
                <h.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{h.value}</p>
                <p className="text-sm text-muted-foreground">{h.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} variant="enclosed">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add">Add Member</TabsTrigger>
          <TabsTrigger value="batch">Batch Entry</TabsTrigger>
          <TabsTrigger value="directory">Directory</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMembers && recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Avatar size="sm">
                    {member.profile_picture_url && (
                      <AvatarImage
                        src={member.profile_picture_url}
                        alt={`${member.first_name} ${member.last_name}`}
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <AvatarFallback>
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {member.first_name} {member.last_name}
                    </p>
                    {member.created_at && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent members.</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/members/list" className="text-sm text-primary font-medium flex items-center hover:underline">
              View all members <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/members/add">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl">
                  Add Single Member
                </Button>
              </Link>

              <div className="bg-gray-50 border p-4 rounded-xl space-y-4">
                {actions.slice(1).map((a) => (
                  <Link
                    to={a.href}
                    key={a.label}
                    className="flex items-center justify-between hover:underline"
                  >
                    <div className="flex items-center space-x-3">
                      <a.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{a.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default MembersDashboard;
