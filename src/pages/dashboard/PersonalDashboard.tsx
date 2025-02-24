import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  ChevronUp,
  ChevronDown,
  PieChart,
  BarChart3,
  LineChart,
  CreditCard,
  Layers,
  Calendar,
  Target,
  Award,
} from 'lucide-react';

function PersonalDashboard() {
  const { currency } = useCurrencyStore();
  const { user } = useAuthStore();

  // Get associated member data
  const { data: memberData } = useQuery({
    queryKey: ['current-user-member', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;

      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name')
        .eq('email', user.email)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  // Get personal monthly trends
  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['personal-monthly-trends', memberData?.id],
    queryFn: async () => {
      if (!memberData?.id) throw new Error('Member not found');

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
            .eq('member_id', memberData.id)
            .gte('date', start.toISOString())
            .lte('date', end.toISOString());

          if (error) throw error;

          const contributions = transactions
            ?.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const previousMonth = subMonths(start, 1);
          const { data: prevTransactions } = await supabase
            .from('financial_transactions')
            .select('type, amount')
            .eq('member_id', memberData.id)
            .gte('date', startOfMonth(previousMonth).toISOString())
            .lte('date', endOfMonth(previousMonth).toISOString())
            .eq('type', 'income');

          const previousContributions = prevTransactions
            ?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const percentageChange = previousContributions === 0 
            ? 100 
            : ((contributions - previousContributions) / previousContributions) * 100;

          return {
            month,
            contributions,
            percentageChange,
          };
        })
      );

      return monthlyData;
    },
    enabled: !!memberData?.id,
  });

  // Get personal contribution statistics
  const { data: contributionStats, isLoading: statsLoading } = useQuery({
    queryKey: ['personal-contribution-stats', memberData?.id],
    queryFn: async () => {
      if (!memberData?.id) throw new Error('Member not found');

      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Get yearly contributions
      const { data: yearlyTransactions, error: yearlyError } = await supabase
        .from('financial_transactions')
        .select('type, amount, category')
        .eq('member_id', memberData.id)
        .eq('type', 'income')
        .gte('date', startOfYear.toISOString())
        .lte('date', endOfYear.toISOString());

      if (yearlyError) throw yearlyError;

      // Get monthly contributions
      const { data: monthlyTransactions, error: monthlyError } = await supabase
        .from('financial_transactions')
        .select('type, amount, category')
        .eq('member_id', memberData.id)
        .eq('type', 'income')
        .gte('date', firstDayOfMonth.toISOString())
        .lte('date', lastDayOfMonth.toISOString());

      if (monthlyError) throw monthlyError;

      // Calculate category breakdowns
      const categoryTotals = yearlyTransactions?.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const sortedCategories = Object.entries(categoryTotals || {})
        .sort(([, a], [, b]) => b - a);

      const yearlyTotal = yearlyTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const monthlyTotal = monthlyTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Calculate average contribution
      const averageContribution = yearlyTransactions?.length 
        ? yearlyTotal / yearlyTransactions.length 
        : 0;

      return {
        yearlyTotal,
        monthlyTotal,
        averageContribution,
        categoryBreakdown: sortedCategories,
      };
    },
    enabled: !!memberData?.id,
  });

  const isLoading = trendsLoading || statsLoading || !memberData;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (!memberData) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No Member Account Found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your user account is not associated with any member profile.
          Please contact an administrator to link your account to your member profile.
        </p>
      </Card>
    );
  }

  const cards = [
    {
      name: 'Monthly Contributions',
      value: formatCurrency(contributionStats?.monthlyTotal || 0, currency),
      icon: <TrendingUp className="text-emerald-500 dark:text-emerald-400" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/50',
      trend: monthlyTrends?.[monthlyTrends.length - 1]?.percentageChange
    },
    {
      name: 'Yearly Contributions',
      value: formatCurrency(contributionStats?.yearlyTotal || 0, currency),
      icon: <Target className="text-blue-500 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/50',
      description: "Total contributions this year"
    },
    {
      name: 'Average Contribution',
      value: formatCurrency(contributionStats?.averageContribution || 0, currency),
      icon: <Award className="text-violet-500 dark:text-violet-400" />,
      color: 'bg-violet-100 dark:bg-violet-900/50',
      description: "Average per contribution"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        {/* Monthly Contribution Trends */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <LineChart className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Monthly Contribution Trends
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
                        {formatCurrency(month.contributions, currency)}
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
                    value={(month.contributions / Math.max(...monthlyTrends.map(m => m.contributions))) * 100}
                    size="sm"
                    variant={month.percentageChange >= 0 ? 'success' : 'danger'}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" />
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Contribution Categories
                </h3>
              </div>
            </div>
            <div className="space-y-4">
              {contributionStats?.categoryBreakdown.map(([category, amount]) => {
                const percentage = (amount / contributionStats.yearlyTotal) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {category.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      size="sm"
                      variant="primary"
                      className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
                    />
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Contribution Summary */}
      <Card>
        <div className="p-4">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" />
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              Contribution Summary
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Year-to-Date Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Year-to-Date Progress
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(contributionStats?.yearlyTotal || 0, currency)}
                </span>
              </div>
              <Progress
                value={100}
                size="md"
                variant="success"
                className="bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30"
              />
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Month
                </h4>
                <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(contributionStats?.monthlyTotal || 0, currency)}
                </p>
                <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">
                  Total contributions this month
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Per Contribution
                </h4>
                <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(contributionStats?.averageContribution || 0, currency)}
                </p>
                <p className="mt-1 text-sm text-blue-600/70 dark:text-blue-400/70">
                  Average contribution amount
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PersonalDashboard;