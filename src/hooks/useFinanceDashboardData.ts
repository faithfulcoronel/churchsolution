import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { useCurrencyStore } from '../stores/currencyStore';
import { formatCurrency } from '../utils/currency';

export function useFinanceDashboardData() {
  const { currency } = useCurrencyStore();

  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['monthly-trends', currentTenant?.id],
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
            .select(
              `type, amount, category:category_id (name, type), fund:fund_id (name, code)`
            )
            .eq('tenant_id', currentTenant?.id)
            .gte('date', format(startOfDay(start), 'yyyy-MM-dd'))
            .lte('date', format(endOfDay(end), 'yyyy-MM-dd'));

          if (error) throw error;

          const income =
            transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const expenses =
            transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const previousMonth = subMonths(start, 1);
          const { data: prevTransactions } = await supabase
            .from('financial_transactions')
            .select('amount')
            .eq('tenant_id', currentTenant?.id)
            .eq('type', 'income')
            .gte('date', format(startOfDay(startOfMonth(previousMonth)), 'yyyy-MM-dd'))
            .lte('date', format(endOfDay(endOfMonth(previousMonth)), 'yyyy-MM-dd'));

          const previousIncome = prevTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const percentageChange =
            previousIncome === 0 ? null : ((income - previousIncome) / previousIncome) * 100;

          return {
            month,
            income,
            expenses,
            percentageChange,
          };
        })
      );

      return monthlyData;
    },
    enabled: !!currentTenant?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['finance-stats', currentTenant?.id],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = startOfMonth(today);
      const lastDayOfMonth = endOfMonth(today);

      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select(
          `type, amount, category:category_id (id, name, type), fund:fund_id (id, name, code)`
        )
        .eq('tenant_id', currentTenant?.id)
        .gte('date', format(startOfDay(firstDayOfMonth), 'yyyy-MM-dd'))
        .lte('date', format(endOfDay(lastDayOfMonth), 'yyyy-MM-dd'));

      if (transactionsError) throw transactionsError;

      const monthlyIncome =
        transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const monthlyExpenses =
        transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const incomeByCategory =
        transactions?.filter(t => t.type === 'income').reduce((acc, t) => {
          const categoryName = t.category?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>) || {};

      const expensesByCategory =
        transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
          const categoryName = t.category?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>) || {};

      const { data: activeBudgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('id')
        .eq('tenant_id', currentTenant?.id)
        .gte('end_date', format(today, 'yyyy-MM-dd'))
        .lte('start_date', format(today, 'yyyy-MM-dd'));

      if (budgetsError) throw budgetsError;

      return {
        monthlyIncome,
        monthlyExpenses,
        activeBudgets: activeBudgets?.length || 0,
        incomeByCategory,
        expensesByCategory,
      };
    },
    enabled: !!currentTenant?.id,
  });

  const { data: fundBalances } = useQuery({
    queryKey: ['fund-balances', currentTenant?.id],
    queryFn: async () => {
      const { data: funds, error } = await supabase
        .from('funds')
        .select('id, name, type')
        .eq('tenant_id', currentTenant?.id)
        .is('deleted_at', null);
      if (error) throw error;

      if (!funds) return [];

      const { data: txs, error: txError } = await supabase
        .from('financial_transactions')
        .select('fund_id, type, amount, debit, credit')
        .eq('tenant_id', currentTenant?.id)
        .not('fund_id', 'is', null);
      if (txError) throw txError;

      return funds.map(f => {
        const total = (txs || []).filter(t => t.fund_id === f.id).reduce((sum, t) => {
          if (t.type) {
            return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
          }
          return sum + (Number(t.debit || 0) - Number(t.credit || 0));
        }, 0);
        return { ...f, balance: total };
      });
    },
    enabled: !!currentTenant?.id,
  });

  const monthlyTrendsChartData = useMemo(() => {
    return {
      series: [
        { name: 'Income', data: monthlyTrends?.map(m => m.income) || [] },
        { name: 'Expenses', data: monthlyTrends?.map(m => m.expenses) || [] },
      ],
      options: {
        chart: { type: 'area', stacked: false, height: 350, toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: [2, 2] },
        xaxis: {
          categories: monthlyTrends?.map(m => m.month) || [],
          labels: { style: { colors: 'hsl(var(--muted-foreground))' } },
        },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value, currency),
            style: { colors: 'hsl(var(--muted-foreground))' },
          },
        },
        legend: { labels: { colors: 'hsl(var(--foreground))' } },
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] },
        },
        tooltip: { y: { formatter: (value: number) => formatCurrency(value, currency) } },
      },
    };
  }, [monthlyTrends, currency]);

  const incomeCategoryChartData = useMemo(() => {
    return {
      series: Object.values(stats?.incomeByCategory || {}),
      options: {
        chart: { type: 'donut' },
        labels: Object.keys(stats?.incomeByCategory || {}),
        legend: { position: 'bottom', labels: { colors: 'hsl(var(--foreground))' } },
        dataLabels: { enabled: true, formatter: (value: number) => `${value.toFixed(2)}%` },
        tooltip: { y: { formatter: (value: number) => formatCurrency(value, currency) } },
      },
    };
  }, [stats, currency]);

  const expenseCategoryChartData = useMemo(() => {
    return {
      series: Object.values(stats?.expensesByCategory || {}),
      options: {
        chart: { type: 'donut' },
        labels: Object.keys(stats?.expensesByCategory || {}),
        legend: { position: 'bottom', labels: { colors: 'hsl(var(--foreground))' } },
        dataLabels: { enabled: true, formatter: (value: number) => `${value.toFixed(2)}%` },
        tooltip: { y: { formatter: (value: number) => formatCurrency(value, currency) } },
      },
    };
  }, [stats, currency]);

  const isLoading = trendsLoading || statsLoading;

  return {
    currency,
    monthlyTrends,
    stats,
    fundBalances,
    monthlyTrendsChartData,
    incomeCategoryChartData,
    expenseCategoryChartData,
    isLoading,
  };
}
