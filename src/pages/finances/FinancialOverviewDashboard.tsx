import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useFinanceDashboardData } from "../../hooks/useFinanceDashboardData";
import { useCurrencyStore } from "../../stores/currencyStore";
import { formatCurrency } from "../../utils/currency";
import MetricCard from "../../components/dashboard/MetricCard";
import { Container } from "../../components/ui2/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui2/card";
import { Charts } from "../../components/ui2/charts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui2/dropdown-menu";
import { Button } from "../../components/ui2/button";
import { DateRangePickerField } from "../../components/ui2/date-range-picker-field";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui2/tabs";
import { Input } from "../../components/ui2/input";
import RecentTransactionItem from "../../components/finances/RecentTransactionItem";
import { useFinancialTransactionHeaderRepository } from "../../hooks/useFinancialTransactionHeaderRepository";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Percent,
  Settings,
  Loader2,
  Search,
  ChevronRight,
} from "lucide-react";

function getExpenseRating(ratio: number) {
  if (ratio <= 30) return "Excellent";
  if (ratio <= 40) return "Good";
  if (ratio <= 50) return "Fair";
  if (ratio <= 60) return "Concern";
  return "Poor";
}

function FinancialOverviewDashboard() {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [transactionSearch, setTransactionSearch] = React.useState('');

  const initialFrom = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    return startOfMonth(d);
  }, []);

  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: initialFrom,
    to: new Date(),
  });

  const {
    monthlyTrends,
    incomeCategoryChartData,
    expenseCategoryChartData,
    isLoading,
  } = useFinanceDashboardData(dateRange);
  const { useQuery: useTransactionQuery } = useFinancialTransactionHeaderRepository();
  const { data: transactionResult, isLoading: transactionsLoading } = useTransactionQuery({
    filters: {
      transaction_date: {
        operator: 'between',
        value: format(dateRange.from, 'yyyy-MM-dd'),
        valueTo: format(dateRange.to, 'yyyy-MM-dd'),
      },
    },
    order: { column: 'transaction_date', ascending: false },
    pagination: { page: 1, pageSize: 20 },
    relationships: [
      { table: 'financial_sources', foreignKey: 'source_id', select: ['id', 'name', 'source_type'] },
    ],
  });
  
  const transactions = transactionResult?.data || [];
  const filteredTransactions = React.useMemo(() => {
    const term = transactionSearch.toLowerCase();
    return transactions.filter(
      (t) =>
        t.transaction_number.toLowerCase().includes(term) ||
        (t.description || "").toLowerCase().includes(term) ||
        (t.reference || "").toLowerCase().includes(term),
    );
  }, [transactions, transactionSearch]);


  const filteredTrends = React.useMemo(() => {
    if (!monthlyTrends) return [];
    return monthlyTrends.filter((t) => {
      const d = new Date(`${t.month} 01`);
      return d >= startOfMonth(dateRange.from) && d <= endOfMonth(dateRange.to);
    });
  }, [monthlyTrends, dateRange]);

  const totalIncome = React.useMemo(() => {
    return filteredTrends.reduce((sum, t) => sum + t.income, 0);
  }, [filteredTrends]);

  const totalExpenses = React.useMemo(() => {
    return filteredTrends.reduce((sum, t) => sum + t.expenses, 0);
  }, [filteredTrends]);

  const netIncome = totalIncome - totalExpenses;

  const last = filteredTrends[filteredTrends.length - 1];
  const prev = filteredTrends[filteredTrends.length - 2];

  const incomeChange =
    last && prev && prev.income
      ? ((last.income - prev.income) / prev.income) * 100
      : 0;
  const expenseChange =
    last && prev && prev.expenses
      ? ((last.expenses - prev.expenses) / prev.expenses) * 100
      : 0;
  const netChange =
    last && prev
      ? ((last.income - last.expenses - (prev.income - prev.expenses)) /
          Math.abs(prev.income - prev.expenses || 1)) *
        100
      : 0;

  const expenseRatio =
    totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const trendsChartData = React.useMemo(() => {
    return {
      series: [
        { name: "Income", data: filteredTrends.map((t) => t.income) },
        { name: "Expenses", data: filteredTrends.map((t) => t.expenses) },
        { name: "Net", data: filteredTrends.map((t) => t.income - t.expenses) },
      ],
      options: {
        chart: {
          type: "area",
          stacked: false,
          height: 350,
          toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: [2, 2, 2] },
        xaxis: {
          categories: filteredTrends.map((t) => t.month),
          labels: { style: { colors: "hsl(var(--muted-foreground))" } },
        },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value, currency),
            style: { colors: "hsl(var(--muted-foreground))" },
          },
        },
        legend: { labels: { colors: "hsl(var(--foreground))" } },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.2,
            stops: [0, 90, 100],
          },
        },
        tooltip: {
          y: { formatter: (value: number) => formatCurrency(value, currency) },
        },
      },
    };
  }, [filteredTrends, currency]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Container className="space-y-6 max-w-[1200px]" size="xl">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">
            Financial Overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Comprehensive view of church finances and trends
          </p>
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
              <DropdownMenuItem onClick={() => navigate("/finances/funds")}>
                Setup funds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/accounts/sources")}>
                Setup financial sources
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/accounts/chart-of-accounts")}
              >
                Setup chart of accounts
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate("/finances/configuration/donation-categories")
                }
              >
                Setup income categories
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate("/finances/configuration/expense-categories")
                }
              >
                Setup expense categories
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Income"
          value={formatCurrency(totalIncome, currency)}
          icon={TrendingUp}
          subtext={`${incomeChange.toFixed(1)}% from last month`}
        />
        <MetricCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses, currency)}
          icon={TrendingDown}
          subtext={`${expenseChange.toFixed(1)}% from last month`}
        />
        <MetricCard
          label="Net Income"
          value={formatCurrency(netIncome, currency)}
          icon={Banknote}
          subtext={`${netChange.toFixed(1)}% from last month`}
        />
        <MetricCard
          label="Expense Ratio"
          value={`${expenseRatio.toFixed(1)}%`}
          icon={Percent}
          subtext={getExpenseRating(expenseRatio)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 bg-muted p-1 rounded-full">
          <TabsTrigger
            value="overview"
            className="flex-1 text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 text-sm font-medium px-6 py-2 rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:text-black dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            All Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly financial trends</CardTitle>
                <CardDescription>
                  Income, expense, and net income over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Charts
                  type="area"
                  series={trendsChartData.series}
                  options={trendsChartData.options}
                  height={350}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>
                  Breakdown of income categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Charts
                  type="donut"
                  series={incomeCategoryChartData.series}
                  options={incomeCategoryChartData.options}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Current month expense categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Charts
                type="donut"
                series={expenseCategoryChartData.series}
                options={expenseCategoryChartData.options}
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full space-y-4 md:space-y-0">
                <div className="text-gray-900 dark:text-gray-100">
                  <CardTitle>Transaction Records</CardTitle>
                  <CardDescription>
                    Search and review transactions
                  </CardDescription>
                </div>
                <div className="w-full md:w-auto">
                  <Input
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    placeholder="Search transactions..."
                    icon={<Search className="h-4 w-4" />}
                    className="w-full md:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {transactionsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <RecentTransactionItem key={t.id} transaction={t} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No transactions found.
                </p>
              )}
              <div className="pt-4">
                <Link
                  to="/finances/transactions"
                  className="text-sm text-primary font-medium flex items-center hover:underline"
                >
                  View all transactions{" "}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

export default FinancialOverviewDashboard;
