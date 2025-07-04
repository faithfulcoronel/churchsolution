import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useCurrencyStore } from '../stores/currencyStore';

export function useExpenseDashboardData(dateRange: { from: Date; to: Date }) {
  const { currency } = useCurrencyStore();

  const fetchTotals = async (from: Date, to: Date) => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return [] as any[];
    const { data, error } = await supabase
      .from('income_expense_transactions')
      .select('amount')
      .eq('tenant_id', tenantId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', format(from, 'yyyy-MM-dd'))
      .lte('transaction_date', format(to, 'yyyy-MM-dd'));
    if (error) throw error;
    return data || [];
  };

  const fetchCount = async (from: Date, to: Date) => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return 0;
    const { count, error } = await supabase
      .from('income_expense_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', format(from, 'yyyy-MM-dd'))
      .lte('transaction_date', format(to, 'yyyy-MM-dd'));
    if (error) throw error;
    return count || 0;
  };

  const fetchPayees = async () => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return 0;
    const { data, error } = await supabase
      .from('income_expense_transactions')
      .select('account_id')
      .eq('tenant_id', tenantId)
      .eq('transaction_type', 'expense')
      .not('account_id', 'is', null);
    if (error) throw error;
    const unique = new Set((data || []).map(r => r.account_id as string));
    return unique.size;
  };

  const monthStart = startOfMonth(dateRange.from);
  const monthEnd = endOfMonth(dateRange.to);
  const prevMonthStart = startOfMonth(subMonths(monthStart, 1));
  const prevMonthEnd = endOfMonth(subMonths(monthStart, 1));
  const weekStart = startOfWeek(dateRange.to, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 0 });

  const { data: monthTotals } = useQuery({
    queryKey: ['expense-summary', monthStart, monthEnd],
    queryFn: () => fetchTotals(monthStart, monthEnd),
  });

  const { data: prevMonthTotals } = useQuery({
    queryKey: ['expense-summary-prev', prevMonthStart, prevMonthEnd],
    queryFn: () => fetchTotals(prevMonthStart, prevMonthEnd),
  });

  const { data: weekTotals } = useQuery({
    queryKey: ['expense-summary-week', weekStart, weekEnd],
    queryFn: () => fetchTotals(weekStart, weekEnd),
  });

  const { data: monthCount } = useQuery({
    queryKey: ['expense-count', monthStart, monthEnd],
    queryFn: () => fetchCount(monthStart, monthEnd),
  });

  const { data: weekCount } = useQuery({
    queryKey: ['expense-count-week', weekStart, weekEnd],
    queryFn: () => fetchCount(weekStart, weekEnd),
  });

  const { data: payeeCount } = useQuery({
    queryKey: ['expense-payees'],
    queryFn: fetchPayees,
  });

  const sumAmount = (rows: any[] | undefined) =>
    rows?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;

  const thisMonthTotal = sumAmount(monthTotals);
  const lastMonthTotal = sumAmount(prevMonthTotals);
  const thisWeekTotal = sumAmount(weekTotals);

  const monthChange =
    lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  const avgExpense = monthCount && monthCount > 0 ? thisMonthTotal / monthCount : 0;

  return {
    currency,
    thisMonthTotal,
    monthChange,
    payeeCount: payeeCount || 0,
    thisWeekTotal,
    weekCount: weekCount || 0,
    avgExpense,
  };
}
