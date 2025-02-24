import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  PiggyBank,
  ChevronUp,
  ChevronDown,
  PieChart,
  BarChart3,
  LineChart,
  Users2,
  CreditCard,
  Layers,
  Cake,
} from 'lucide-react';

function ChurchDashboard() {
  const { currency } = useCurrencyStore();

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

  // Get current month's data
  const { data: stats, isLoading: statsLoading } = useQuery({
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

  // Get birthdays for current month
  const { data: birthdays, isLoading: birthdaysLoading } = useQuery({
    queryKey: ['birthdays'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_month_birthdays');
      if (error) throw error;
      return data;
    },
  });

  const isLoading = statsLoading || trendsLoading || birthdaysLoading;

  const cards = [
    {
      name: 'Total Members',
      value: stats?.totalMembers || 0,
      icon: <Users className="text-blue-500 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/50',
      description: "Active church members"
    },
    {
      name: 'Monthly Income',
      value: formatCurrency(stats?.monthlyIncome || 0, currency),
      icon: <TrendingUp className="text-emerald-500 dark:text-emerald-400" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/50',
      trend: monthlyTrends?.[monthlyTrends.length - 1]?.percentageChange
    },
    {
      name: 'Monthly Expenses',
      value: formatCurrency(stats?.monthlyExpenses || 0, currency),
      icon: <TrendingDown className="text-rose-500 dark:text-rose-400" />,
      color: 'bg-rose-100 dark:bg-rose-900/50',
      description: "Total expenses this month"
    },
    {
      name: 'Active Budgets',
      value: stats?.activeBudgets || 0,
      icon: <PiggyBank className="text-violet-500 dark:text-violet-400" />,
      color: 'bg-violet-100 dark:bg-violet-900/50',
      description: "Currently active budgets"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((_, i) => (
          <Card key={i} className="animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card 
            key={card.name} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className={`${card.color} p-2 rounded-lg`}>
                  {card.icon}
                </div>
                {card.trend !== undefined && (
                  <Badge
                    variant={card.trend >= 0 ? 'success' : 'danger'}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    {card.trend >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    <span>{Math.abs(card.trend).toFixed(1)}%</span>
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.name}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Monthly Trends
                </h3>
              </div>
              <Badge variant="secondary" size="sm">Last 12 Months</Badge>
            </div>
            <div className="space-y-3">
              {monthlyTrends?.map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{month.month}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(month.income, currency)}
                      </span>
                      <span className={`
                        flex items-center text-xs
                        ${month.percentageChange >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                        }
                      `}>
                        {month.percentageChange >= 0 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {Math.abs(month.percentageChange).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(month.income / Math.max(...monthlyTrends.map(m => m.income))) * 100}
                    size="sm"
                    variant={month.percentageChange >= 0 ? 'success' : 'danger'}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Birthdays Card */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Cake className="h-5 w-5 text-pink-500 dark:text-pink-400 mr-2" />
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Birthdays This Month
                </h3>
              </div>
            </div>
            
            {birthdays && birthdays.length > 0 ? (
              <div className="space-y-3">
                {birthdays.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {member.first_name[0]}
                        </span>
                      </div>
                      <div className="ml-3 truncate">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(member.birthday), 'MMMM d')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="primary"
                      size="sm"
                      className="ml-2 shrink-0 bg-gradient-to-r from-pink-500 to-rose-500 dark:from-pink-600 dark:to-rose-600 text-white"
                    >
                      {format(new Date(member.birthday), 'MMM d')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No birthdays this month
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <div className="p-4">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              Financial Summary
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Monthly Balance */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Monthly Balance</span>
                <span className={stats?.monthlyIncome - stats?.monthlyExpenses >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
                }>
                  {formatCurrency(Math.abs(stats?.monthlyIncome - stats?.monthlyExpenses), currency)}
                  {stats?.monthlyIncome - stats?.monthlyExpenses < 0 && ' (Deficit)'}
                </span>
              </div>
              <Progress
                value={(stats?.monthlyIncome / (stats?.monthlyExpenses || 1)) * 100}
                variant={stats?.monthlyIncome >= stats?.monthlyExpenses ? 'success' : 'danger'}
                size="md"
                className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30"
              />
            </div>

            {/* Income/Expense Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Income
                </h4>
                <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats?.monthlyIncome || 0, currency)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Expenses
                </h4>
                <p className="text-xl font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(stats?.monthlyExpenses || 0, currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ChurchDashboard;