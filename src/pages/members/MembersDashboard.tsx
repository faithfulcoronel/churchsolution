import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { tenantUtils } from '../../utils/tenantUtils';
import { startOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui2/card';
import MetricCard from '../../components/dashboard/MetricCard';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  ChevronRight,
  FileText,
  Search,
} from 'lucide-react';
import { Container } from '../../components/ui2/container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui2/tabs';
import { Input } from '../../components/ui2/input';

interface MemberSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  membership_date: string | null;
  membership_status: { name: string } | null;
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
        .select(
          'id, first_name, last_name, email, contact_number, membership_date, profile_picture_url, created_at, membership_status(name)'
        )
        .eq('tenant_id', tenant.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []) as MemberSummary[];
    },
    enabled: !!tenant?.id,
  });

  const [directorySearch, setDirectorySearch] = React.useState('');
  const { data: directoryMembers } = useQuery({
    queryKey: ['directory-members', tenant?.id, directorySearch],
    queryFn: async () => {
      if (!tenant?.id) return [] as MemberSummary[];
      const search = directorySearch.trim();
      let query = supabase
        .from('members')
        .select('id, first_name, last_name, profile_picture_url')
        .eq('tenant_id', tenant.id)
        .is('deleted_at', null)
        .order('last_name', { ascending: true })
        .limit(3);
      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,preferred_name.ilike.%${search}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MemberSummary[];
    },
    enabled: !!tenant?.id,
  });

  const highlights = [
    {
      name: 'Total Members',
      value: totalMembers || 0,
      icon: Users,
      subtext: 'Active members',
    },
    {
      name: 'New This Month',
      value: newMembers || 0,
      icon: UserPlus,
      subtext: 'Joined this month',
    },
    {
      name: 'Visitors',
      value: visitorCount || 0,
      icon: UserCheck,
      subtext: 'Current visitors',
    },
    {
      name: 'Families',
      value: familyCount || 0,
      icon: Heart,
      subtext: 'Family groups',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h) => (
          <MetricCard
            key={h.name}
            label={h.name}
            value={h.value}
            icon={h.icon}
            subtext={h.subtext}
          />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 bg-muted p-1 rounded-full">
          <TabsTrigger
            value="overview"
            className="flex-1 text-sm font-medium text-gray-700 px-6 py-2 rounded-full transition-colors duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:text-black"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="directory"
            className="flex-1 text-sm font-medium text-gray-700 px-6 py-2 rounded-full transition-colors duration-200 ease-in-out data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:text-black"
          >
            Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Choose how you’d like to add new members</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Link to="/members/add" className="w-full md:w-1/2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm py-5 px-6 rounded-lg shadow-md flex flex-col items-center justify-center gap-1">
                  <UserPlus className="text-white text-xl" />
                  <span>Add Single Member</span>
                  <span className="text-xs font-normal">Individual entry form</span>
                </div>
              </Link>
              <Link to="/members/batch" className="w-full md:w-1/2">
                <div className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-5 px-6 rounded-lg flex flex-col items-center justify-center gap-1">
                  <FileText className="text-xl text-gray-600" />
                  <span>Batch Entry</span>
                  <span className="text-xs text-gray-500">Spreadsheet-style entry</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardContent className="space-y-4">
              <Input
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search members..."
                icon={<Search className="h-4 w-4" />}
              />
              <div className="space-y-4">
                {directoryMembers && directoryMembers.length > 0 ? (
                  directoryMembers.map((member) => (
                    <Link
                      key={member.id}
                      to={`/members/${member.id}`}
                      className="flex items-center space-x-3 hover:underline"
                    >
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
                      <span className="font-medium text-foreground">
                        {member.first_name} {member.last_name}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No members found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Additions</CardTitle>
            <CardDescription>Latest member entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {recentMembers && recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <p className="font-medium text-foreground">
                        {member.first_name} {member.last_name}
                      </p>
                      {member.email && (
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                      {member.contact_number && (
                        <p className="text-sm text-muted-foreground">
                          {member.contact_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {member.membership_status?.name && (
                      <p className="font-medium text-foreground">
                        {member.membership_status.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {member.membership_date
                        ? new Date(member.membership_date).toLocaleDateString()
                        : member.created_at
                        ? new Date(member.created_at).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent members.</p>
            )}
          </CardContent>
          <CardFooter>
            <Link
              to="/members/list"
              className="text-sm text-primary font-medium flex items-center hover:underline"
            >
              View all members <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </Container>
  );
}

export default MembersDashboard;
