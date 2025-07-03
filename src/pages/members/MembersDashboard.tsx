import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tenantUtils } from "../../utils/tenantUtils";
import { supabase } from "../../lib/supabase";
import { useMemberRepository } from "../../hooks/useMemberRepository";
import { useMembershipStatusRepository } from "../../hooks/useMembershipStatusRepository";
import { startOfMonth } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui2/card";
import MetricCard from "../../components/dashboard/MetricCard";
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  ChevronRight,
  FileText,
  Search,
  Mail,
  Phone,
  Settings,
} from "lucide-react";
import { Container } from "../../components/ui2/container";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui2/tabs";
import { Input } from "../../components/ui2/input";
import { RecentMemberItem, DirectoryMemberItem } from "../../components/members";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui2/dropdown-menu";
import { Button } from "../../components/ui2/button";

interface MemberSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  membership_date: string | null;
  membership_status: { name: string; code: string } | null;
  profile_picture_url: string | null;
  created_at: string | null;
  address?: string | null;
}

function MembersDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const navigate = useNavigate();
  const { data: tenant } = useQuery({
    queryKey: ["current-tenant"],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const { useQuery: useMembersQuery } = useMemberRepository();
  const { useQuery: useStatusQuery } = useMembershipStatusRepository();

  const { data: visitorStatusData } = useStatusQuery({
    filters: { code: { operator: 'eq', value: 'visitor' } },
    enabled: !!tenant?.id
  });
  const visitorStatus = visitorStatusData?.data?.[0]?.id || null;

  const { data: totalMembersResult } = useMembersQuery({
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id
  });
  const totalMembers = totalMembersResult?.count ?? 0;

  const { data: newMembersResult } = useMembersQuery({
    filters: { created_at: { operator: 'gte', value: startOfMonth(new Date()).toISOString() } },
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id
  });
  const newMembers = newMembersResult?.count ?? 0;

  const { data: visitorCountResult } = useMembersQuery({
    filters: { status_category_id: { operator: 'eq', value: visitorStatus } },
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id && !!visitorStatus
  });
  const visitorCount = visitorCountResult?.count ?? 0;

  const { data: familyCount } = useQuery({
    queryKey: ["family-count", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      const { count, error } = await supabase
        .from("family_relationships")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenant?.id,
  });

  const { data: recentMembersResult } = useMembersQuery({
    order: { column: 'created_at', ascending: false },
    pagination: { page: 1, pageSize: 5 },
    enabled: !!tenant?.id
  });
  const recentMembers = (recentMembersResult?.data || []) as MemberSummary[];

  const [directorySearch, setDirectorySearch] = React.useState("");
  const { data: directoryMembersResult } = useMembersQuery({
    filters: directorySearch.trim()
      ? {
          or: `first_name.ilike.*${directorySearch.trim()}*,last_name.ilike.*${directorySearch.trim()}*,preferred_name.ilike.*${directorySearch.trim()}*`
        }
      : undefined,
    order: { column: 'last_name', ascending: true },
    pagination: { page: 1, pageSize: 5 },
    enabled: !!tenant?.id
  });
  const directoryMembers = (directoryMembersResult?.data || []) as MemberSummary[];

  const highlights = [
    {
      name: "Total Members",
      value: totalMembers || 0,
      icon: Users,
      subtext: "Active members",
    },
    {
      name: "New This Month",
      value: newMembers || 0,
      icon: UserPlus,
      subtext: "Joined this month",
    },
    {
      name: "Visitors",
      value: visitorCount || 0,
      icon: UserCheck,
      subtext: "Current visitors",
    },
    {
      name: "Families",
      value: familyCount || 0,
      icon: Heart,
      subtext: "Family groups",
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
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/members/configuration/membership-types')}>
                Manage Membership Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/members/configuration/membership-status')}>
                Manage Membership Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/members/configuration/relationship-types')}>
                Manage Relationship Types
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 px-6 py-2 rounded-full transition-colors duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-black dark:hover:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="directory"
            className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 px-6 py-2 rounded-full transition-colors duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-black dark:hover:text-foreground"
          >
            Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Choose how you’d like to add new members
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Link to="/members/add" className="w-full md:w-1/2">
                <Card
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm py-5 px-6 rounded-lg shadow-md flex flex-col items-center justify-center gap-1"
                  hoverable
                >
                  <UserPlus className="text-white text-xl" />
                  <span>Add Single Member</span>
                  <span className="text-xs font-normal">
                    Individual entry form
                  </span>
                </Card>
              </Link>
              <Link to="/members/batch" className="w-full md:w-1/2">
                <Card
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium py-5 px-6 rounded-lg flex flex-col items-center justify-center gap-1"
                  hoverable
                >
                  <FileText className="text-xl text-gray-600 dark:text-gray-300" />
                  <span>Batch Entry</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Spreadsheet-style entry
                  </span>
                </Card>
              </Link>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                Recent Additions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Latest member entries
              </p>
              <div className="flex flex-col space-y-2">
                {recentMembers && recentMembers.length > 0 ? (
                  recentMembers.map((member) => (
                    <RecentMemberItem key={member.id} member={member} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent members.
                  </p>
                )}
              </div>
              <div className="pt-4">
                <Link
                  to="/members/list"
                  className="text-sm text-primary font-medium flex items-center hover:underline"
                >
                  View all members <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Member Directory</CardTitle>
                <CardDescription>Search and manage all members</CardDescription>
              </div>
              <Input
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search members..."
                icon={<Search className="h-4 w-4" />}
                className="md:w-64 ml-auto"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {directoryMembers && directoryMembers.length > 0 ? (
                directoryMembers.map((member) => (
                  <DirectoryMemberItem key={member.id} member={member} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No members found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

export default MembersDashboard;
