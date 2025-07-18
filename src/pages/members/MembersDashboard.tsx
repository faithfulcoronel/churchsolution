import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tenantUtils } from "../../utils/tenantUtils";
import { supabase } from "../../lib/supabase";
import { useMemberService } from "../../hooks/useMemberService";
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
  Cake,
} from "lucide-react";
import { Container } from "../../components/ui2/container";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui2/tabs";
import { Input } from "../../components/ui2/input";
import {
  RecentMemberItem,
  DirectoryMemberItem,
  BirthdayMemberItem,
} from "../../components/members";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui2/dropdown-menu";
import { Button } from "../../components/ui2/button";
import AddMemberDialog from "./AddMemberDialog";

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
  birthday?: string | null;
}

function MembersDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const { data: tenant } = useQuery({
    queryKey: ["current-tenant"],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const {
    useQuery: useMembersQuery,
    useCurrentMonthBirthdays,
    useBirthdaysByMonth,
  } = useMemberService();
  const { useQuery: useStatusQuery } = useMembershipStatusRepository();

  const { data: visitorStatusData } = useStatusQuery({
    filters: { code: { operator: "eq", value: "visitor" } },
    enabled: !!tenant?.id,
  });
  const visitorStatus = visitorStatusData?.data?.[0]?.id || null;

  const { data: totalMembersResult } = useMembersQuery({
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id,
  });
  const totalMembers = totalMembersResult?.count ?? 0;

  const { data: newMembersResult } = useMembersQuery({
    filters: {
      created_at: {
        operator: "gte",
        value: startOfMonth(new Date()).toISOString(),
      },
    },
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id,
  });
  const newMembers = newMembersResult?.count ?? 0;

  const { data: visitorCountResult } = useMembersQuery({
    filters: { status_category_id: { operator: "eq", value: visitorStatus } },
    pagination: { page: 1, pageSize: 1 },
    enabled: !!tenant?.id && !!visitorStatus,
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
    order: { column: "created_at", ascending: false },
    pagination: { page: 1, pageSize: 5 },
    enabled: !!tenant?.id,
  });
  const recentMembers = (recentMembersResult?.data || []) as MemberSummary[];

  const [directorySearch, setDirectorySearch] = React.useState("");
  const { data: directoryMembersResult } = useMembersQuery({
    filters: directorySearch.trim()
      ? {
          or: `first_name.ilike.*${directorySearch.trim()}*,last_name.ilike.*${directorySearch.trim()}*,preferred_name.ilike.*${directorySearch.trim()}*`,
        }
      : undefined,
    order: { column: "last_name", ascending: true },
    pagination: { page: 1, pageSize: 5 },
    enabled: !!tenant?.id,
  });
  const directoryMembers = (directoryMembersResult?.data ||
    []) as MemberSummary[];

  const [birthdayTab, setBirthdayTab] = React.useState('today');
  const [selectedMonth, setSelectedMonth] = React.useState(
    new Date().getMonth() + 1,
  );
  const { data: currentMonthBirthdays } = useCurrentMonthBirthdays();
  const todayBirthdays = React.useMemo(() => {
    if (!currentMonthBirthdays) return [];
    const today = new Date();
    return currentMonthBirthdays.filter(b => {
      const d = new Date(b.birthday);
      return d.getDate() === today.getDate();
    });
  }, [currentMonthBirthdays]);
  const { data: selectedMonthBirthdaysData } = useBirthdaysByMonth(selectedMonth);
  const selectedMonthBirthdays = selectedMonthBirthdaysData || [];

  const highlights = [
    {
      name: "Total Members",
      value: totalMembers || 0,
      icon: Users,
      iconClassName: "text-primary",
      barClassName: "bg-primary",
      subtext: "Active members",
      subtextClassName: "text-primary/70",
    },
    {
      name: "New This Month",
      value: newMembers || 0,
      icon: UserPlus,
      iconClassName: "text-success",
      barClassName: "bg-success",
      subtext: "Joined this month",
      subtextClassName: "text-success/70",
    },
    {
      name: "Visitors",
      value: visitorCount || 0,
      icon: UserCheck,
      iconClassName: "text-info",
      barClassName: "bg-info",
      subtext: "Current visitors",
      subtextClassName: "text-info/70",
    },
    {
      name: "Families",
      value: familyCount || 0,
      icon: Heart,
      iconClassName: "text-warning",
      barClassName: "bg-warning",
      subtext: "Family groups",
      subtextClassName: "text-warning/70",
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
              <DropdownMenuItem
                onClick={() =>
                  navigate("/members/configuration/membership-types")
                }
              >
                Manage Membership Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate("/members/configuration/membership-status")
                }
              >
                Manage Membership Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate("/members/configuration/relationship-types")
                }
              >
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
            iconClassName={h.iconClassName}
            barClassName={h.barClassName}
            subtext={h.subtext}
            subtextClassName={h.subtextClassName}
          />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 bg-muted p-1 rounded-full">
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
          <TabsTrigger
            value="birthdays"
            className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 px-6 py-2 rounded-full transition-colors duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:text-black dark:hover:text-foreground"
          >
            Birthdays
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
              <div className="w-full md:w-1/2">
                <Card
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm py-5 px-6 rounded-lg shadow-md flex flex-col items-center justify-center gap-1"
                  hoverable
                  onClick={() => setAddDialogOpen(true)}
                >
                  <UserPlus className="text-white text-xl" />
                  <span>Add Single Member</span>
                  <span className="text-xs font-normal">
                    Individual entry form
                  </span>
                </Card>
              </div>
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
              <div className="text-gray-900 dark:text-gray-100 mt-4">
                <CardTitle>Recent Additions</CardTitle>
                <CardDescription>Latest member entries</CardDescription>
              </div>
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
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full space-y-4 md:space-y-0">
                <div className="text-gray-900 dark:text-gray-100">
                  <CardTitle>Member Directory</CardTitle>
                  <CardDescription>
                    Search and manage all members
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Input
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search members..."
                    icon={<Search className="h-4 w-4" />}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {directoryMembers && directoryMembers.length > 0 ? (
                directoryMembers.map((member) => (
                  <DirectoryMemberItem key={member.id} member={member} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No members found.
                </p>
              )}
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

        <TabsContent value="birthdays" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Birthdays</CardTitle>
              <CardDescription>Celebrate your members</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={birthdayTab} onValueChange={setBirthdayTab}>
                <TabsList className="w-full grid grid-cols-3 bg-muted p-1 rounded-full">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="year">By Month</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-4 space-y-2">
                  {todayBirthdays.length ? (
                    todayBirthdays.map((m) => (
                      <BirthdayMemberItem key={m.id} member={m as any} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No birthdays today.</p>
                  )}
                </TabsContent>

                <TabsContent value="month" className="mt-4 space-y-2">
                  {currentMonthBirthdays && currentMonthBirthdays.length ? (
                    currentMonthBirthdays.map((m) => (
                      <BirthdayMemberItem key={m.id} member={m as any} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No birthdays this month.</p>
                  )}
                </TabsContent>

                <TabsContent value="year" className="mt-4 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=> (
                      <Button
                        key={i}
                        variant={selectedMonth===i+1?'default':'outline'}
                        size="sm"
                        onClick={()=>setSelectedMonth(i+1)}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {selectedMonthBirthdays.length ? (
                      selectedMonthBirthdays.map((m) => (
                        <BirthdayMemberItem key={m.id} member={m as any} />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No birthdays.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddMemberDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </Container>
  );
}

export default MembersDashboard;
