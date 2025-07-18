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
import { MetricCardSkeleton } from '../../components/dashboard/MetricCardSkeleton';
import { DataGridSkeleton } from '../../components/dashboard/DataGridSkeleton';
import { Container } from '../../components/ui2/container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui2/tabs';
import { Input } from '../../components/ui2/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui2/dropdown-menu';
import { Button } from '../../components/ui2/button';
import SingleDonationDialog from './SingleDonationDialog';
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
import DonationActions from '../../components/finances/DonationActions';
import { TransactionItem as DonationItem } from '../../components/finances/RecentTransactionItem';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Badge } from '../../components/ui2/badge';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { useIncomeExpenseTransactionRepository } from '../../hooks/useIncomeExpenseTransactionRepository';
import { useOfferingDashboardData } from '../../hooks/useOfferingDashboardData';
import { tenantUtils } from '../../utils/tenantUtils';

function OfferingsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showDonationDialog, setShowDonationDialog] = React.useState(false);
  const dateRange = React.useMemo(
    () => ({ from: startOfMonth(new Date()), to: new Date() }),
    []
  );

  const { data: tenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });

  const { isLoading: metricsLoading, ...metrics } = useOfferingDashboardData(dateRange);
  const { currency } = useCurrencyStore();

  const [recentPage, setRecentPage] = React.useState(0);
  const [recentPageSize, setRecentPageSize] = React.useState(5);
  const [historyPage, setHistoryPage] = React.useState(0);
  const [historyPageSize, setHistoryPageSize] = React.useState(5);

  const statusVariantMap: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
    posted: 'success',
    approved: 'warning',
    submitted: 'info',
    draft: 'secondary',
    voided: 'destructive',
  };

  const columns: GridColDef<DonationItem>[] = [
    {
      field: 'transaction_date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      renderCell: params => format(new Date(params.row.transaction_date), 'MMM d, yyyy'),
    },
    {
      field: 'display_name',
      headerName: 'Donor/Account',
      flex: 1.5,
      minWidth: 160,
      valueGetter: params =>
        params.row.accounts?.name ||
        (params.row.member ? `${params.row.member.first_name} ${params.row.member.last_name}` : 'Anonymous'),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      valueGetter: params => params.row.categories?.name || 'Uncategorized',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      renderCell: params => formatCurrency(params.row.amount, currency),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      valueGetter: params => params.row.header?.status || 'draft',
      renderCell: params => (
        <Badge variant={statusVariantMap[params.value] || 'secondary'} className="capitalize">
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: params => <DonationActions donation={params.row} />,
    },
  ];

  const { useQuery: useTxQuery } = useIncomeExpenseTransactionRepository();
  const { data: recentResult, isLoading: recentLoading } = useTxQuery({
    filters: { transaction_type: { operator: 'eq', value: 'income' } },
    order: { column: 'transaction_date', ascending: false },
    pagination: { page: 1, pageSize: 5 },
    relationships: [
      {
        table: 'financial_transaction_headers',
        foreignKey: 'header_id',
        alias: 'header',
        select: ['id', 'status'],
      },
      {
        table: 'accounts',
        foreignKey: 'account_id',
        select: ['id', 'name'],
      },
      {
        table: 'categories',
        foreignKey: 'category_id',
        select: ['id','code', 'name'],
      },
    ],
    enabled: !!tenant?.id,
  });
  const recentDonations = (recentResult?.data || []) as DonationItem[];

  const [historySearch, setHistorySearch] = React.useState('');
  const { data: historyResult, isLoading: historyLoading } = useTxQuery({
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
        alias: 'header',
        select: ['id', 'status'],
      },
      {
        table: 'accounts',
        foreignKey: 'account_id',
        select: ['id', 'name'],
      },
      {
        table: 'categories',
        foreignKey: 'category_id',
        select: ['id','code', 'name'],
      },
    ],
    enabled: !!tenant?.id,
  });
  const historyDonations = (historyResult?.data || []) as DonationItem[];

  const highlights = [
    {
      name: 'This Month',
      value: formatCurrency(metrics.thisMonthTotal, currency),
      icon: DollarSign,
      iconClassName: 'text-success',
      barClassName: 'bg-success',
      subtext: `${metrics.monthChange.toFixed(1)}% from last month`,
      subtextClassName: 'text-success/70',
    },
    {
      name: 'Total Donors',
      value: metrics.donorCount,
      icon: Users,
      iconClassName: 'text-primary',
      barClassName: 'bg-primary',
      subtext: 'Active contributors',
      subtextClassName: 'text-primary/70',
    },
    {
      name: 'This Week',
      value: formatCurrency(metrics.thisWeekTotal, currency),
      icon: Calendar,
      iconClassName: 'text-info',
      barClassName: 'bg-info',
      subtext: `From ${metrics.weekCount} donations`,
      subtextClassName: 'text-info/70',
    },
    {
      name: 'Avg. Donation',
      value: formatCurrency(metrics.avgDonation, currency),
      icon: HandCoins,
      iconClassName: 'text-warning',
      barClassName: 'bg-warning',
      subtext: 'Per contribution',
      subtextClassName: 'text-warning/70',
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
        {metricsLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <MetricCardSkeleton key={i} />)
          : highlights.map((h) => (
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
              <div className="w-full md:w-1/2">
                <Card
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm py-5 px-6 rounded-lg shadow-md flex flex-col items-center justify-center gap-1"
                  hoverable
                  onClick={() => setShowDonationDialog(true)}
                >
                  <HandCoins className="text-white text-xl" />
                  <span>Record Single Donation</span>
                  <span className="text-xs font-normal">Individual entry form</span>
                </Card>
              </div>
              <Link to="/finances/giving/add" className="w-full md:w-1/2">
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
              {recentLoading ? (
                <DataGridSkeleton />
              ) : recentDonations && recentDonations.length > 0 ? (
                <DataGrid<DonationItem>
                  columns={columns}
                  data={recentDonations}
                  totalRows={recentDonations.length}
                  paginationMode="client"
                  page={recentPage}
                  pageSize={recentPageSize}
                  onPageChange={setRecentPage}
                  onPageSizeChange={setRecentPageSize}
                  getRowId={(row) => row.id}
                  autoHeight
                  showQuickFilter={false}
                  onRowClick={(params) =>
                    navigate(
                      params.row.header?.status === 'draft'
                        ? `/finances/giving/${params.row.header_id}/edit`
                        : `/finances/giving/${params.row.header_id}`
                    )
                  }
                  storageKey="recent-donations-grid"
                  loading={recentLoading}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No recent donations.</p>
              )}
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
              {historyLoading ? (
                <DataGridSkeleton />
              ) : historyDonations && historyDonations.length > 0 ? (
                <DataGrid<DonationItem>
                  columns={columns}
                  data={historyDonations}
                  totalRows={historyDonations.length}
                  paginationMode="client"
                  page={historyPage}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  onPageSizeChange={setHistoryPageSize}
                  getRowId={(row) => row.id}
                  autoHeight
                  showQuickFilter={false}
                  onRowClick={(params) =>
                    navigate(
                      params.row.header?.status === 'draft'
                        ? `/finances/giving/${params.row.header_id}/edit`
                        : `/finances/giving/${params.row.header_id}`
                    )
                  }
                  storageKey="donation-records-grid"
                  loading={historyLoading}
                />
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
      <SingleDonationDialog
        open={showDonationDialog}
        onOpenChange={setShowDonationDialog}
      />
    </Container>
  );
}

export default OfferingsDashboard;
