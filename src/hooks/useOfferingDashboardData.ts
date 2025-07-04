import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear } from 'date-fns';
import { useCurrencyStore } from '../stores/currencyStore';

export function useOfferingDashboardData(dateRange: { from: Date; to: Date }) {
  const { currency } = useCurrencyStore();

  const fetchSummary = async (from: Date, to: Date) => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return [] as any[];
    const { data, error } = await supabase.rpc('report_offering_summary', {
      p_tenant_id: tenantId,
      p_start_date: format(from, 'yyyy-MM-dd'),
      p_end_date: format(to, 'yyyy-MM-dd'),
    });
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
      .eq('transaction_type', 'income')
      .gte('transaction_date', format(from, 'yyyy-MM-dd'))
      .lte('transaction_date', format(to, 'yyyy-MM-dd'));
    if (error) throw error;
    return count || 0;
  };

  const fetchDonors = async () => {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return 0;
    const { data, error } = await supabase.rpc('report_member_giving_summary', {
      p_tenant_id: tenantId,
      p_start_date: format(startOfYear(new Date()), 'yyyy-MM-dd'),
      p_end_date: format(new Date(), 'yyyy-MM-dd'),
      p_member_id: null,
    });
    if (error) throw error;
    return (data || []).length;
  };

  const monthStart = startOfMonth(dateRange.from);
  const monthEnd = endOfMonth(dateRange.to);
  const prevMonthStart = startOfMonth(subMonths(monthStart, 1));
  const prevMonthEnd = endOfMonth(subMonths(monthStart, 1));
  const weekStart = startOfWeek(dateRange.to, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(dateRange.to, { weekStartsOn: 0 });

  const { data: monthSummary, isLoading: monthSummaryLoading } = useQuery({
    queryKey: ['offering-summary', monthStart, monthEnd],
    queryFn: () => fetchSummary(monthStart, monthEnd),
  });

  const { data: prevMonthSummary, isLoading: prevMonthSummaryLoading } = useQuery({
    queryKey: ['offering-summary-prev', prevMonthStart, prevMonthEnd],
    queryFn: () => fetchSummary(prevMonthStart, prevMonthEnd),
  });

  const { data: weekSummary, isLoading: weekSummaryLoading } = useQuery({
    queryKey: ['offering-summary-week', weekStart, weekEnd],
    queryFn: () => fetchSummary(weekStart, weekEnd),
  });

  const { data: monthCount, isLoading: monthCountLoading } = useQuery({
    queryKey: ['offering-count', monthStart, monthEnd],
    queryFn: () => fetchCount(monthStart, monthEnd),
  });

  const { data: weekCount, isLoading: weekCountLoading } = useQuery({
    queryKey: ['offering-count-week', weekStart, weekEnd],
    queryFn: () => fetchCount(weekStart, weekEnd),
  });

  const { data: donorCount, isLoading: donorCountLoading } = useQuery({
    queryKey: ['offering-donors'],
    queryFn: fetchDonors,
  });

  const sumAmount = (rows: any[] | undefined) =>
    rows?.reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

  const thisMonthTotal = sumAmount(monthSummary);
  const lastMonthTotal = sumAmount(prevMonthSummary);
  const thisWeekTotal = sumAmount(weekSummary);

  const monthChange =
    lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  const avgDonation = monthCount && monthCount > 0 ? thisMonthTotal / monthCount : 0;

  const isLoading =
    monthSummaryLoading ||
    prevMonthSummaryLoading ||
    weekSummaryLoading ||
    monthCountLoading ||
    weekCountLoading ||
    donorCountLoading;

  return {
    currency,
    thisMonthTotal,
    monthChange,
    donorCount: donorCount || 0,
    thisWeekTotal,
    weekCount: weekCount || 0,
    avgDonation,
    isLoading,
  };
}
