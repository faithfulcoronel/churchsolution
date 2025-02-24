import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import {
  Plus,
  Upload,
  PiggyBank,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  PieChart,
  BarChart3,
  LineChart,
  Users2,
  CreditCard,
  Layers,
  Cake,
} from 'lucide-react';

function FinancesDashboard() {
  const { currency } = useCurrencyStore();
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBulkDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get monthly trends data
  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['monthly-trends'],
    queryFn: async () => {
      const today = new Date();
      const months = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(today, i);
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
          month: format(date, 'MMM yyyy'),
        };
      }).reverse();

      const monthlyData = await Promise.all(
        months.map(async ({ start, end, month }) => {
          const { data: transactions, error } = await supabase
            .from('financial_transactions')
            .select('type, amount, category')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString());

          if (error) throw error;

          const income = transactions
            ?.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const previousMonth = subMonths(start, 1);
          const { data: prevTransactions } = await supabase
            .from('financial_transactions')
            .select('type, amount')
            .gte('date', startOfMonth(previousMonth).toISOString())
            .lte('date', endOfMonth(previousMonth).toISOString())
            .eq('type', 'income');

          const previousIncome = prevTransactions
            ?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const percentageChange = previousIncome === 0 
            ? 100 
            : ((income - previousIncome) / previousIncome) * 100;

          return {
            month,
            income,
            percentageChange,
          };
        })
      );

      return monthlyData;
    },
  });

  // Get overall statistics
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ['overall-stats'],
    queryFn: async () => {
      // Get all income transactions
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select(`
          amount,
          category,
          member:members (
            id,
            first_name,
            last_name
          )
        `)
        .eq('type', 'income')
        .is('members.deleted_at', null);

      if (error) throw error;

      // Calculate total number of unique givers
      const uniqueGivers = new Set(
        transactions
          ?.filter(t => t.member)
          .map(t => t.member.id)
      ).size;

      // Calculate average gift amount
      const totalAmount = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const averageGift = transactions?.length ? totalAmount / transactions.length : 0;

      // Calculate top giving categories
      const categoryTotals = transactions?.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const sortedCategories = Object.entries(categoryTotals || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return {
        uniqueGivers,
        averageGift,
        topCategories: sortedCategories,
      };
    },
  });

  // Get current year's data
  const { data: yearlyStats, isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearly-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);

      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select(`
          type,
          amount,
          category,
          date,
          member:members (
            id,
            first_name,
            last_name
          )
        `)
        .gte('date', startOfYear.toISOString())
        .lte('date', endOfYear.toISOString())
        .is('members.deleted_at', null);

      if (transactionsError) throw transactionsError;

      const yearlyIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const yearlyExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Calculate member contributions
      const memberContributions = transactions
        ?.filter(t => t.type === 'income' && t.member)
        .reduce((acc, t) => {
          const memberId = t.member.id;
          if (!acc[memberId]) {
            acc[memberId] = {
              name: `${t.member.first_name} ${t.member.last_name}`,
              total: 0,
            };
          }
          acc[memberId].total += Number(t.amount);
          return acc;
        }, {} as Record<string, { name: string; total: number }>);

      return {
        yearlyIncome,
        yearlyExpenses,
        memberContributions: Object.values(memberContributions || {})
          .sort((a, b) => b.total - a.total)
          .slice(0, 5), // Top 5 contributors
      };
    },
  });

  // Get current month's data
  const { data: stats, isLoading: monthlyLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total members count
      const { count: membersCount, error: membersError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (membersError) throw membersError;

      // Get current month's transactions
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('type, amount')
        .gte('date', firstDayOfMonth.toISOString())
        .lte('date', lastDayOfMonth.toISOString());

      if (transactionsError) throw transactionsError;

      const monthlyIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const monthlyExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Get active budgets count
      const { data: activeBudgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('id')
        .gte('end_date', today.toISOString())
        .lte('start_date', today.toISOString());

      if (budgetsError) throw budgetsError;

      return {
        totalMembers: membersCount || 0,
        monthlyIncome,
        monthlyExpenses,
        activeBudgets: activeBudgets?.length || 0,
      };
    },
  });

  const isLoading = monthlyLoading || yearlyLoading || trendsLoading || statsLoading;

  const cards = [
    {
      name: 'Monthly Income',
      value: stats?.monthlyIncome
        ? formatCurrency(stats.monthlyIncome, currency)
        : '-',
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: monthlyTrends?.[monthlyTrends.length - 1]?.percentageChange,
    },
    {
      name: 'Monthly Expenses',
      value: stats?.monthlyExpenses
        ? formatCurrency(stats.monthlyExpenses, currency)
        : '-',
      icon: TrendingDown,
      color: 'bg-red-500',
    },
    {
      name: 'Net Balance',
      value: stats
        ? formatCurrency(stats.monthlyIncome - stats.monthlyExpenses, currency)
        : '-',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Budgets',
      value: stats?.activeBudgets ?? '-',
      icon: Calendar,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Finances</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage church finances, track income and expenses, and monitor budgets.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex flex-wrap gap-3 items-center justify-end">
          <SubscriptionGate type="transaction">
            <Link to="/finances/transactions/add">
              <Button
                variant="primary"
                icon={<Plus />}
              >
                Add Transaction
              </Button>
            </Link>
          </SubscriptionGate>

          <div className="relative" ref={dropdownRef}>
            <Button
              variant="primary"
              onClick={() => setShowBulkDropdown(!showBulkDropdown)}
              icon={<Upload />}
            >
              Bulk Entry
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${showBulkDropdown ? 'rotate-180' : ''}`} />
            </Button>

            {showBulkDropdown && (
              <Card className="absolute right-0 mt-2 w-56 z-10">
                <div className="py-1">
                  <Link
                    to="/finances/transactions/bulk"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowBulkDropdown(false)}
                  >
                    <Layers className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Bulk Transaction Entry</span>
                  </Link>
                  <Link
                    to="/finances/transactions/bulk-income"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowBulkDropdown(false)}
                  >
                    <TrendingUp className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Bulk Income Entry</span>
                  </Link>
                  <Link
                    to="/finances/transactions/bulk-expense"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowBulkDropdown(false)}
                  >
                    <TrendingDown className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Bulk Expense Entry</span>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div className="flex gap-3">
            <Link to="/finances/budgets/add">
              <Button
                variant="outline"
                icon={<PiggyBank />}
              >
                Add Budget
              </Button>
            </Link>
            <Link to="/finances/reports">
              <Button
                variant="outline"
                icon={<FileText />}
              >
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.name} hoverable>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 text-white p-1 rounded ${card.color}`} />
                  </div>
                  {typeof card.trend === 'number' && (
                    <div className={`flex items-center text-sm ${
                      card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend >= 0 ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(card.trend).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">{card.name}</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analysis */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
              </div>
              <Badge variant="primary">Last 12 Months</Badge>
            </div>
            <div className="space-y-4">
              {monthlyTrends?.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{month.month}</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(month.income, currency)}
                      </span>
                      <span className={`ml-2 flex items-center text-xs ${
                        month.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {month.percentageChange >= 0 ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {Math.abs(month.percentageChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(month.income / Math.max(...monthlyTrends.map(m => m.income))) * 100}
                    max={100}
                    size="sm"
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
              </div>
              <Badge variant="secondary">Current Month</Badge>
            </div>
            <div className="space-y-4">
              {overallStats?.topCategories.map(([category, amount]) => {
                const percentage = (amount / overallStats.topCategories[0][1]) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {category.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      max={100}
                      size="sm"
                      className="mt-1"
                      variant={
                        percentage > 66 ? 'success' :
                        percentage > 33 ? 'warning' :
                        'danger'
                      }
                    />
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links and Actions */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Quick Links</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/finances/transactions">
                <Card hoverable className="h-full">
                  <div className="p-4 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Transactions</h4>
                      <p className="text-xs text-gray-500">View all financial records</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/finances/budgets">
                <Card hoverable className="h-full">
                  <div className="p-4 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <PiggyBank className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Budgets</h4>
                      <p className="text-xs text-gray-500">Manage budget allocations</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/finances/reports">
                <Card hoverable className="h-full">
                  <div className="p-4 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Reports</h4>
                      <p className="text-xs text-gray-500">Generate financial reports</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link to="/finances/transactions/bulk">
                <Card hoverable className="h-full">
                  <div className="p-4 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Layers className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Bulk Entry</h4>
                      <p className="text-xs text-gray-500">Enter multiple transactions</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Bulk Operations</h3>
            </div>
            <div className="space-y-4">
              <Link to="/finances/transactions/bulk">
                <Card hoverable>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Layers className="h-6 w-6 text-primary-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Bulk Transaction Entry</h4>
                        <p className="text-xs text-gray-500">Enter multiple transactions at once</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
              <Link to="/finances/transactions/bulk-income">
                <Card hoverable>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Bulk Income Entry</h4>
                        <p className="text-xs text-gray-500">Record multiple income transactions</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
              <Link to="/finances/transactions/bulk-expense">
                <Card hoverable>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Bulk Expense Entry</h4>
                        <p className="text-xs text-gray-500">Record multiple expense transactions</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default FinancesDashboard;