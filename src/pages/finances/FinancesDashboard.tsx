import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Progress } from '../../components/ui2/progress';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { DropdownButton } from '../../components/ui2/dropdown-button';
import {
  Plus,
  Upload,
  PiggyBank,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useFinanceDashboardData } from '../../hooks/useFinanceDashboardData';
import { StatsCards } from './dashboard/StatsCards';
import { FundBalances } from './dashboard/FundBalances';
import { MonthlyTrendsChart } from './dashboard/MonthlyTrendsChart';
import { CategoryDistributionCharts } from './dashboard/CategoryDistributionCharts';
import { QuickLinks } from './dashboard/QuickLinks';

function FinancesDashboard() {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();

  const {
    stats,
    fundBalances,
    monthlyTrends,
    monthlyTrendsChartData,
    incomeCategoryChartData,
    expenseCategoryChartData,
    isLoading,
  } = useFinanceDashboardData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Accounting</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage church finances, track income and expenses, and monitor budgets.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-wrap gap-3 items-center justify-end">
          <SubscriptionGate type="transaction">
            <Link to="/finances/transactions/add">
              <Button
                variant="default"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </SubscriptionGate>

          <DropdownButton
            variant="default"
            icon={<Upload className="h-4 w-4" />}
            items={[
              {
                label: 'Bulk Transaction Entry',
                icon: <Layers className="h-4 w-4" />,
                onClick: () => navigate('/finances/transactions/add')
              },
              {
                label: 'Bulk Income Entry',
                icon: <TrendingUp className="h-4 w-4" />,
                onClick: () => navigate('/finances/transactions/add?type=income')
              },
              {
                label: 'Bulk Expense Entry',
                icon: <TrendingDown className="h-4 w-4" />,
                onClick: () => navigate('/finances/transactions/add?type=expense')
              }
            ]}
          >
            Bulk Entry
          </DropdownButton>

          <div className="flex gap-3">
            <Link to="/finances/budgets/add">
              <Button
                variant="outline"
                className="flex items-center"
              >
                <PiggyBank className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </Link>
            <Link to="/finances/reports">
              <Button
                variant="outline"
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards stats={stats} trends={monthlyTrends} currency={currency} />
      <FundBalances funds={fundBalances} currency={currency} />

      {/* Monthly Trends Chart */}
      <MonthlyTrendsChart data={monthlyTrendsChartData} />

      {/* Category Distribution Charts */}
      <CategoryDistributionCharts
        incomeData={incomeCategoryChartData}
        expenseData={expenseCategoryChartData}
      />

      {/* Financial Summary */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-base font-medium text-foreground">
              Financial Summary
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Monthly Balance */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Monthly Balance</span>
                <span className={stats?.monthlyIncome - stats?.monthlyExpenses >= 0 
                  ? 'text-success' 
                  : 'text-destructive'
                }>
                  {formatCurrency(Math.abs(stats?.monthlyIncome - stats?.monthlyExpenses), currency)}
                  {stats?.monthlyIncome - stats?.monthlyExpenses < 0 && ' (Deficit)'}
                </span>
              </div>
              <Progress
                value={(stats?.monthlyIncome / (stats?.monthlyExpenses || 1)) * 100}
                variant={stats?.monthlyIncome >= stats?.monthlyExpenses ? 'success' : 'destructive'}
                className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30"
              />
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </h4>
                <p className="mt-2 text-2xl font-semibold text-success">
                  {formatCurrency(stats?.monthlyIncome || 0, currency)}
                </p>
                <p className="mt-1 text-sm text-success/70">
                  Total income this month
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Monthly Expenses
                </h4>
                <p className="mt-2 text-2xl font-semibold text-destructive">
                  {formatCurrency(stats?.monthlyExpenses || 0, currency)}
                </p>
                <p className="mt-1 text-sm text-destructive/70">
                  Total expenses this month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
}

export default FinancesDashboard;