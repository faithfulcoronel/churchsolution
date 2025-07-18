import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  subMonths,
  format,
} from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui2/card';
import { Charts } from '../../../components/ui2/charts';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';
import { Loader2 } from 'lucide-react';

interface FinancialTabProps {
  memberId: string;
}

export default function FinancialTab({ memberId }: FinancialTabProps) {
  const { currency } = useCurrencyStore();

  const { data: totals, isLoading: totalsLoading } = useQuery({
    queryKey: ['member-financial-totals', memberId],
    queryFn: async () => {
      const today = new Date();
      const [yearRes, monthRes, weekRes] = await Promise.all([
        supabase
          .from('financial_transactions')
          .select('debit, credit')
          .eq('member_id', memberId)
          .eq('type', 'income')
          .gte('date', format(startOfYear(today), 'yyyy-MM-dd'))
          .lte('date', format(endOfYear(today), 'yyyy-MM-dd')),
        supabase
          .from('financial_transactions')
          .select('debit, credit')
          .eq('member_id', memberId)
          .eq('type', 'income')
          .gte('date', format(startOfMonth(today), 'yyyy-MM-dd'))
          .lte('date', format(endOfMonth(today), 'yyyy-MM-dd')),
        supabase
          .from('financial_transactions')
          .select('debit, credit')
          .eq('member_id', memberId)
          .eq('type', 'income')
          .gte('date', format(startOfWeek(today), 'yyyy-MM-dd'))
          .lte('date', format(endOfWeek(today), 'yyyy-MM-dd')),
      ]);

      if (yearRes.error) throw yearRes.error;
      if (monthRes.error) throw monthRes.error;
      if (weekRes.error) throw weekRes.error;

      const sum = (rows: any[]) =>
        rows.reduce((s, r) => s + Number(r.debit || 0) - Number(r.credit || 0), 0);

      return {
        year: sum(yearRes.data || []),
        month: sum(monthRes.data || []),
        week: sum(weekRes.data || []),
      };
    },
    enabled: !!memberId,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['member-financial-trends', memberId],
    queryFn: async () => {
      const today = new Date();
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(today, i);
        return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM yyyy') };
      }).reverse();

      const data = await Promise.all(
        months.map(async ({ start, end, label }) => {
          const { data, error } = await supabase
            .from('financial_transactions')
            .select('debit, credit')
            .eq('member_id', memberId)
            .eq('type', 'income')
            .gte('date', format(start, 'yyyy-MM-dd'))
            .lte('date', format(end, 'yyyy-MM-dd'));
          if (error) throw error;
          const total =
            data?.reduce((s, r) => s + Number(r.debit || 0) - Number(r.credit || 0), 0) || 0;
          return { month: label, contributions: total };
        })
      );
      return data;
    },
    enabled: !!memberId,
  });

  const { data: recent } = useQuery({
    queryKey: ['member-recent-transactions', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(
          `id, date, description, debit, credit,
           category:category_id (name),
           fund:fund_id (name, code)`
        )
        .eq('member_id', memberId)
        .eq('type', 'income')
        .order('date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
  });

  const chartData = React.useMemo(
    () => ({
      series: [
        {
          name: 'Contributions',
          data: (trends || []).map(t => t.contributions),
        },
      ],
      options: {
        xaxis: { categories: (trends || []).map(t => t.month) },
        yaxis: {
          labels: { formatter: (v: number) => formatCurrency(v, currency) },
        },
        tooltip: { y: { formatter: (v: number) => formatCurrency(v, currency) } },
      },
    }),
    [trends, currency]
  );

  if (totalsLoading && !totals) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Giving this Year</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.year || 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Giving this Month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.month || 0, currency)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Giving this Week</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totals?.week || 0, currency)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giving Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Charts type="area" series={chartData.series} options={chartData.options} height={300} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Contributions</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {recent && recent.length > 0 ? (
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map(t => (
                  <tr key={t.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {t.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-2 text-sm">{t.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                      {formatCurrency(Number(t.debit || 0) - Number(t.credit || 0), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent transactions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
