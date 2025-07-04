import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { container } from "../lib/container";
import { TYPES } from "../lib/types";
import type { IFinanceDashboardRepository } from "../repositories/financeDashboard.repository";
import { useCurrencyStore } from "../stores/currencyStore";
import { formatCurrency } from "../utils/currency";
import { categoryUtils } from "../utils/categoryUtils";
import { startOfMonth, endOfMonth } from "date-fns";

export function useFinanceDashboardData(dateRange?: { from: Date; to: Date }) {
  const { currency } = useCurrencyStore();
  const repository = container.get<IFinanceDashboardRepository>(
    TYPES.IFinanceDashboardRepository,
  );

  const start = dateRange?.from ?? startOfMonth(new Date());
  const end = dateRange?.to ?? endOfMonth(new Date());

  const { data: monthlyTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["monthly-trends", start, end],
    queryFn: () => repository.getMonthlyTrends(start, end),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["finance-stats", start, end],
    queryFn: () => repository.getMonthlyStats(start, end),
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
    queryFn: () => repository.getFundBalances(),
  });

  const { data: sourceBalances, isLoading: sourcesLoading } = useQuery({
    queryKey: ["source-balances"],
    queryFn: () => repository.getSourceBalances(),
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
        plotOptions: { bar: { horizontal: true } },
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
    return {
      series: [
        {
          name: "Balance",
          data: (fundBalances || []).map((f) => f.balance),
        },
      ],
      options: {
        chart: { type: "bar" },
        xaxis: { categories: (fundBalances || []).map((f) => f.name) },
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
