import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { container } from "../lib/container";
import { TYPES } from "../lib/types";
import type { FinanceDashboardService } from "../services/FinanceDashboardService";
import { useCurrencyStore } from "../stores/currencyStore";
import { formatCurrency } from "../utils/currency";
import { categoryUtils } from "../utils/categoryUtils";
import { startOfMonth, endOfMonth } from "date-fns";

export function useFinanceDashboardData(dateRange?: { from: Date; to: Date }) {
  const { currency } = useCurrencyStore();
  const service = container.get<FinanceDashboardService>(
    TYPES.FinanceDashboardService,
  );

  const start = dateRange?.from ?? startOfMonth(new Date());
  const end = dateRange?.to ?? endOfMonth(new Date());

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["monthly-trends", start, end],
    queryFn: () => service.getMonthlyTrends(start, end),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["finance-stats", start, end],
    queryFn: () => service.getMonthlyStats(start, end),
  });

  const { data: incomeCategories, isLoading: incomeCatsLoading } = useQuery({
    queryKey: ["categories", "income_transaction"],
    queryFn: () => categoryUtils.getCategories("income_transaction"),
  });

  const { data: expenseCategories, isLoading: expenseCatsLoading } = useQuery({
    queryKey: ["categories", "expense_transaction"],
    queryFn: () => categoryUtils.getCategories("expense_transaction"),
  });

  const { data: fundBalances, isLoading: fundsLoading } = useQuery({
    queryKey: ["fund-balances"],
    queryFn: () => service.getFundBalances(),
  });

  const { data: sourceBalances, isLoading: sourcesLoading } = useQuery({
    queryKey: ["source-balances"],
    queryFn: () => service.getSourceBalances(),
  });

  const monthlyTrendsChartData = useMemo(() => {
    return {
      series: [
        { name: "Income", data: monthlyTrends?.map((m) => m.income) || [] },
        { name: "Expenses", data: monthlyTrends?.map((m) => m.expenses) || [] },
      ],
      options: {
        chart: {
          type: "area",
          stacked: false,
          height: 350,
          toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: [2, 2] },
        xaxis: {
          categories: monthlyTrends?.map((m) => m.month) || [],
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
  }, [monthlyTrends, currency]);

  const incomeCategoryChartData = useMemo(() => {
    const totals = stats?.incomeByCategory || {};
    const merged = (incomeCategories || []).reduce<Record<string, number>>(
      (acc, c) => {
        acc[c.name] = totals[c.name] ?? 0;
        return acc;
      },
      {},
    );

    return {
      series: Object.values(merged),
      options: {
        chart: { type: "donut" },
        labels: Object.keys(merged),
        legend: {
          position: "bottom",
          labels: { colors: "hsl(var(--foreground))" },
        },
        dataLabels: {
          enabled: true,
          formatter: (value: number) => `${value.toFixed(2)}%`,
        },
        tooltip: {
          y: { formatter: (value: number) => formatCurrency(value, currency) },
        },
      },
    };
  }, [stats, incomeCategories, currency]);

  const expenseCategoryChartData = useMemo(() => {
    const totals = stats?.expensesByCategory || {};
    const items = (expenseCategories || [])
      .map((c) => ({ name: c.name, value: totals[c.name] ?? 0 }))
      .sort((a, b) => b.value - a.value);

    return {
      series: [
        {
          name: "Amount",
          data: items.map((i) => i.value),
        },
      ],
      options: {
        chart: { type: "bar" },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '60%',
            borderRadius: 8,
          },
        },
        xaxis: { categories: items.map((i) => i.name) },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value, currency),
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (value: number) => formatCurrency(value, currency),
        },
        legend: { show: false },
      },
    };
  }, [stats, expenseCategories, currency]);

  const fundBalanceChartData = useMemo(() => {
    const filtered = (fundBalances || []).filter((f) => f.balance !== 0);
    const sorted = [...filtered].sort((a, b) => b.balance - a.balance);

    return {
      series: [
        {
          name: "Balance",
          data: sorted.map((f) => f.balance),
        },
      ],
      options: {
        chart: { type: "bar" },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '60%',
            borderRadius: 8,
          },
        },
        xaxis: { categories: sorted.map((f) => f.name) },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value, currency),
          },
        },
      },
    };
  }, [fundBalances, currency]);

  const sourceBalanceChartData = useMemo(() => {
    return {
      series: [
        {
          name: "Balance",
          data: (sourceBalances || []).map((s) => s.balance),
        },
      ],
      options: {
        chart: { type: "bar" },
        xaxis: { categories: (sourceBalances || []).map((s) => s.name) },
        yaxis: {
          labels: {
            formatter: (value: number) => formatCurrency(value, currency),
          },
        },
      },
    };
  }, [sourceBalances, currency]);

  const isLoading =
    trendsLoading ||
    statsLoading ||
    fundsLoading ||
    sourcesLoading ||
    incomeCatsLoading ||
    expenseCatsLoading;

  return {
    currency,
    monthlyTrends,
    stats,
    fundBalances,
    sourceBalances,
    monthlyTrendsChartData,
    incomeCategoryChartData,
    expenseCategoryChartData,
    fundBalanceChartData,
    sourceBalanceChartData,
    isLoading,
  };
}
