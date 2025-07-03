import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui2/tabs';
import {
  CalendarDays,
  DollarSign,
  TrendingDown,
  Users,
  Bell,
  ChevronRight,
  BarChart3,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import WelcomeGreeting from '../../components/WelcomeGreeting';
import DashboardHeader from '../../components/DashboardHeader';
import { useFinanceDashboardData } from '../../hooks/useFinanceDashboardData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { tenantUtils } from '../../utils/tenantUtils';
import { Badge } from '../../components/ui2/badge';
import { formatCurrency } from '../../utils/currency';
import { useCurrencyStore } from '../../stores/currencyStore';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { createSampleNotification } from '../../utils/createSampleNotification';
import { useMessageStore } from '../../components/MessageHandler';

function ChurchDashboard() {
  const { addMessage } = useMessageStore();
  const { currency } = useCurrencyStore();
  const { stats, monthlyTrends } = useFinanceDashboardData();

  const { data: memberStats } = useQuery({
    queryKey: ['active-member-count'],
    queryFn: async () => {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) return { count: 0, delta: null };

      const { data: status } = await supabase
        .from('categories')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('type', 'member_status')
        .eq('code', 'active')
        .maybeSingle();

      const activeId = status?.id;

      const { count: current } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status_category_id', activeId)
        .is('deleted_at', null);

      const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
      const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));

      const { count: previous } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status_category_id', activeId)
        .lte('created_at', prevMonthEnd.toISOString())
        .is('deleted_at', null);

      const delta = previous && previous > 0 ? ((current || 0 - previous) / previous) * 100 : null;

      return { count: current || 0, delta };
    },
  });

  const { data: eventsStats } = useQuery({
    queryKey: ['upcoming-events-count'],
    queryFn: async () => {
      const tenantId = await tenantUtils.getTenantId();
      if (!tenantId) return { count: 0, delta: null };

      const today = new Date();
      const nextMonth = endOfMonth(today);
      const prevPeriodStart = subMonths(today, 1);

      const { count: upcoming } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('date', today.toISOString())
        .lte('date', nextMonth.toISOString());

      const { count: previous } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('date', subMonths(prevPeriodStart, 1).toISOString())
        .lt('date', prevPeriodStart.toISOString());

      const delta = previous && previous > 0 ? ((upcoming || 0 - previous) / previous) * 100 : null;

      return { count: upcoming || 0, delta };
    },
  });

  const handleCreateNotification = async () => {
    try {
      // Create a random notification type
      const types = ['success', 'info', 'warning', 'error'] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      // Create notification with different content based on type
      switch(randomType) {
        case 'success':
          await createSampleNotification({
            type: 'success',
            title: 'Transaction Completed',
            message: 'Your financial transaction has been processed successfully.',
            actionType: 'redirect',
            actionPayload: '/finances'
          });
          break;
        case 'info':
          await createSampleNotification({
            type: 'info',
            title: 'New Member Joined',
            message: 'A new member has joined your church. Review their profile.',
            actionType: 'redirect',
            actionPayload: '/members'
          });
          break;
        case 'warning':
          await createSampleNotification({
            type: 'warning',
            title: 'Subscription Expiring',
            message: 'Your subscription will expire in 7 days. Please renew to avoid service interruption.',
            actionType: 'redirect',
            actionPayload: '/settings/subscription'
          });
          break;
        case 'error':
          await createSampleNotification({
            type: 'error',
            title: 'Payment Failed',
            message: 'Your recent payment attempt was unsuccessful. Please update your payment method.',
            actionType: 'modal',
            actionPayload: 'payment-failed'
          });
          break;
      }
      
      addMessage({
        type: 'success',
        text: 'Sample notification created! Check the notification bell.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      addMessage({
        type: 'error',
        text: 'Failed to create notification',
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeGreeting />
      
      <div className="flex justify-between items-center">
        <DashboardHeader />
        <Button onClick={handleCreateNotification}>
          <Bell className="mr-2 h-4 w-4" />
          Create Sample Notification
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyIncome || 0, currency)}</div>
                {monthlyTrends && monthlyTrends.length > 1 && (
                  <Badge variant={(monthlyTrends[monthlyTrends.length - 1].income - monthlyTrends[monthlyTrends.length - 2].income) >= 0 ? 'success' : 'destructive'} className="flex items-center space-x-1 text-xs mt-1">
                    {monthlyTrends[monthlyTrends.length - 1].income - monthlyTrends[monthlyTrends.length - 2].income >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span>
                      {Math.abs(((monthlyTrends[monthlyTrends.length - 1].income - monthlyTrends[monthlyTrends.length - 2].income) / (monthlyTrends[monthlyTrends.length - 2].income || 1)) * 100).toFixed(1)}%
                    </span>
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyExpenses || 0, currency)}</div>
                {monthlyTrends && monthlyTrends.length > 1 && (
                  <Badge variant={(monthlyTrends[monthlyTrends.length - 1].expenses - monthlyTrends[monthlyTrends.length - 2].expenses) <= 0 ? 'success' : 'destructive'} className="flex items-center space-x-1 text-xs mt-1">
                    {monthlyTrends[monthlyTrends.length - 1].expenses - monthlyTrends[monthlyTrends.length - 2].expenses <= 0 ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                    <span>
                      {Math.abs(((monthlyTrends[monthlyTrends.length - 1].expenses - monthlyTrends[monthlyTrends.length - 2].expenses) / (monthlyTrends[monthlyTrends.length - 2].expenses || 1)) * 100).toFixed(1)}%
                    </span>
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{memberStats?.count ?? 0}</div>
                {memberStats?.delta != null && (
                  <Badge variant={memberStats.delta >= 0 ? 'success' : 'destructive'} className="flex items-center space-x-1 text-xs mt-1">
                    {memberStats.delta >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span>{Math.abs(memberStats.delta).toFixed(1)}%</span>
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventsStats?.count ?? 0}</div>
                {eventsStats?.delta != null && (
                  <Badge variant={eventsStats.delta >= 0 ? 'success' : 'destructive'} className="flex items-center space-x-1 text-xs mt-1">
                    {eventsStats.delta >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span>{Math.abs(eventsStats.delta).toFixed(1)}%</span>
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Giving Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart3 className="h-16 w-16 text-muted" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  You have 3 events scheduled for this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Sunday Service
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sunday, 10:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Prayer Meeting
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Wednesday, 7:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Youth Group
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Friday, 6:30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <span>View All Events</span>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart3 className="h-16 w-16 text-muted" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart3 className="h-16 w-16 text-muted" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    Monthly Income Statement
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Annual Budget Report
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Giving Summary
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Membership Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    Attendance Report
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    New Member Report
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Ministry Participation
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    Create Custom Report
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Saved Reports
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    Report Templates
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChurchDashboard;