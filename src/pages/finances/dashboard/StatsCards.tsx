import React from 'react';
import { Card, CardContent } from '../../../components/ui2/card';
import { Badge } from '../../../components/ui2/badge';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

interface StatsData {
  monthlyIncome: number;
  monthlyExpenses: number;
  activeBudgets: number;
}

interface TrendData {
  month: string;
  income: number;
  expenses: number;
  percentageChange: number | null;
}

interface Props {
  stats?: StatsData;
  trends?: TrendData[];
  currency: string;
}

export function StatsCards({ stats, trends, currency }: Props) {
  const lastTrend = trends && trends.length ? trends[trends.length - 1] : undefined;

  const cards = [
    {
      name: 'Monthly Income',
      value: formatCurrency(stats?.monthlyIncome || 0, currency),
      icon: <TrendingUp className="text-emerald-500" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/50',
      trend: lastTrend?.percentageChange,
    },
    {
      name: 'Monthly Expenses',
      value: formatCurrency(stats?.monthlyExpenses || 0, currency),
      icon: <TrendingDown className="text-rose-500" />,
      color: 'bg-rose-100 dark:bg-rose-900/50',
    },
    {
      name: 'Net Balance',
      value: formatCurrency((stats?.monthlyIncome || 0) - (stats?.monthlyExpenses || 0), currency),
      icon: <DollarSign className="text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      name: 'Active Budgets',
      value: stats?.activeBudgets || 0,
      icon: <PiggyBank className="text-violet-500" />,
      color: 'bg-violet-100 dark:bg-violet-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card key={card.name} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`${card.color} p-2 rounded-lg`}>{card.icon}</div>
              {'trend' in card && card.trend != null ? (
                <Badge variant={card.trend >= 0 ? 'success' : 'destructive'} className="flex items-center space-x-1">
                  {card.trend >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span>{Math.abs(card.trend).toFixed(1)}%</span>
                </Badge>
              ) : null}
            </div>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
