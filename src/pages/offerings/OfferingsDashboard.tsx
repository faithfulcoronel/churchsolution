import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui2/card';
import MetricCard from '../../components/dashboard/MetricCard';
import { Container } from '../../components/ui2/container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui2/tabs';
import { Input } from '../../components/ui2/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui2/dropdown-menu';
import { Button } from '../../components/ui2/button';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import {
  Users,
  Calendar,
  HandCoins,
  DollarSign,
  Settings,
  ChevronRight,
  FileText,
  Search,
} from 'lucide-react';
import RecentDonationItem, { DonationItem } from '../../components/finances/RecentDonationItem';
import { useIncomeExpenseTransactionRepository } from '../../hooks/useIncomeExpenseTransactionRepository';
import { useOfferingDashboardData } from '../../hooks/useOfferingDashboardData';
import { tenantUtils } from '../../utils/tenantUtils';

function OfferingsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const { data: tenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const metrics = useOfferingDashboardData(dateRange);

  const { useQuery: useTxQuery } = useIncomeExpenseTransactionRepository();
  const { data: recentResult } = useTxQuery({
    filters: { transaction_type: { operator: 'eq', value: 'income' } },
    order: { column: 'transaction_date', ascending: false },
    pagination: { page: 1, pageSize: 5 },
    relationships: [
      {
        table: 'financial_transaction_headers',
        foreignKey: 'header_id',
        select: ['id', 'status'],
      },
    ],
    enabled: !!tenant?.id,
  });
  const recentDonations = (recentResult?.data || []) as DonationItem[];

  const [historySearch, setHistorySearch] = React.useState('');
  const { data: historyResult } = useTxQuery({
    filters: {
      transaction_type: { operator: 'eq', value: 'income' },
      ...(historySearch.trim()
        ? {
            or: `description.ilike.*${historySearch.trim()}*,members.first_name.ilike.*${historySearch.trim()}*,members.last_name.ilike.*${historySearch.trim()}*`,
          }
        : {}),
    },
    order: { column: 'transaction_date', ascending: false },
    pagination: { page: 1, pageSize: 5 },
    relationships: [
      {
        table: 'financial_transaction_headers',
        foreignKey: 'header_id',
        select: ['id', 'status'],
      },
    ],
    enabled: !!tenant?.id,
  });
  const historyDonations = (historyResult?.data || []) as DonationItem[];

  const highlights = [
    {
      name: 'This Month',
      value: metrics.currency ? `${metrics.currency.symbol}${metrics.thisMonthTotal.toFixed(2)}` : metrics.thisMonthTotal.toFixed(2),
      icon: DollarSign,
      subtext: `${metrics.monthChange.toFixed(1)}% from last month`,
    },
    {
      name: 'Total Donors',
      value: metrics.donorCount,
      icon: Users,
      subtext: 'Active contributors',
    },
    {
      name: 'This Week',
      value: metrics.currency ? `${metrics.currency.symbol}${metrics.thisWeekTotal.toFixed(2)}` : metrics.thisWeekTotal.toFixed(2),
      icon: Calendar,
      subtext: `From ${metrics.weekCount} donations`,
    },
    {
      name: 'Avg. Donation',
      value: metrics.currency ? `${metrics.currency.symbol}${metrics.avgDonation.toFixed(2)}` : metrics.avgDonation.toFixed(2),
      icon: HandCoins,
      subtext: 'Per contribution',
    },
  ];

  return (
    <Container className="space-y-6 max-w-[1200px]" size="xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Tithes &amp; Offerings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track and manage church donations and offerings</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2 items-center">
          <DateRangePickerField
            value={{ from: dateRange.from, to: dateRange.to }}
            onChange={(range) => {
              if (range.from && range.to) {
                setDateRange({ from: range.from, to: range.to });
              }
            }}
            showCompactInput
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/finances/funds')}>Setup funds</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/accounts/sources')}>Setup financial sources</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/accounts/chart-of-accounts')}>Setup chart of accounts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/finances/configuration/donation-categories')}>Setup income categories</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/finances/configuration/expense-categories')}>Setup expense categories</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h) => (
          <MetricCard key={h.name} label={h.name} value={h.value} icon={h.icon} subtext={h.subtext} />
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 bg-muted p-1 rounded-full">
          <TabsTrigger value="overview" className="flex-1 text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Choose how you’d like to record donations</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Link to="/finances/giving/add" className="w-full md:w-1/2">
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm py-5 px-6 rounded-lg shadow-md flex flex-col items-center justify-center gap-1" hoverable>
                  <HandCoins className="text-white text-xl" />
                  <span>Record Single Donation</span>
                  <span className="text-xs font-normal">Individual entry form</span>
                </Card>
              </Link>
              <Link to="/finances/giving/import" className="w-full md:w-1/2">
                <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium py-5 px-6 rounded-lg flex flex-col items-center justify-center gap-1" hoverable>
                  <FileText className="text-xl text-gray-600 dark:text-gray-300" />
                  <span>Batch Entry</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet-style entry</span>
                </Card>
              </Link>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardContent className="space-y-4">
              <div className="text-gray-900 dark:text-gray-100 mt-4">
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donation entries</CardDescription>
              </div>
              <div className="flex flex-col space-y-2">
                {recentDonations && recentDonations.length > 0 ? (
                  recentDonations.map((d) => <RecentDonationItem key={d.id} donation={d} />)
                ) : (
                  <p className="text-sm text-muted-foreground">No recent donations.</p>
                )}
              </div>
              <div className="pt-4">
                <Link to="/finances/giving" className="text-sm text-primary font-medium flex items-center hover:underline">
                  View all donations <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full space-y-4 md:space-y-0">
                <div className="text-gray-900 dark:text-gray-100">
                  <CardTitle>Donation Records</CardTitle>
                  <CardDescription>Search and review donations</CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search donations..."
                    icon={<Search className="h-4 w-4" />}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {historyDonations && historyDonations.length > 0 ? (
                historyDonations.map((d) => <RecentDonationItem key={d.id} donation={d} />)
              ) : (
                <p className="text-sm text-muted-foreground">No donations found.</p>
              )}
              <div className="pt-4">
                <Link to="/finances/giving" className="text-sm text-primary font-medium flex items-center hover:underline">
                  View all donations <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

export default OfferingsDashboard;
