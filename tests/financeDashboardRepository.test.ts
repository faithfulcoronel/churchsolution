import { describe, it, expect } from 'vitest';
import { FinanceDashboardRepository } from '../src/repositories/financeDashboard.repository';
import type { IFinanceDashboardAdapter } from '../src/adapters/financeDashboard.adapter';

const adapter: IFinanceDashboardAdapter = {
  fetchMonthlyTrends: async () => [
    { month: '2025-06', income: '100', expenses: '50', percentage_change: '10' },
  ],
  fetchMonthlyStats: async (_start: Date, _end: Date) => ({
    monthly_income: '200',
    monthly_expenses: '75',
    active_budgets: 1,
    income_by_category: { Tithe: 120, Offerings: 80 },
    expenses_by_category: { Utilities: 50, Uncategorized: 25 },
  }),
  fetchFundBalances: async () => [
    { id: 'f1', name: 'General', balance: '25' },
  ],
} as any;

describe('FinanceDashboardRepository mapping', () => {
  const repo = new FinanceDashboardRepository(adapter);

  it('maps monthly trends', async () => {
    const data = await repo.getMonthlyTrends();
    expect(data[0]).toEqual({
      month: new Date('2025-06-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      income: 100,
      expenses: 50,
      percentageChange: 10,
    });
  });

  it('maps monthly stats', async () => {
    const stats = await repo.getMonthlyStats(new Date('2025-06-01'), new Date('2025-06-30'));
    expect(stats).toEqual({
      monthlyIncome: 200,
      monthlyExpenses: 75,
      activeBudgets: 1,
      incomeByCategory: { Tithe: 120, Offerings: 80 },
      expensesByCategory: { Utilities: 50, Uncategorized: 25 },
    });
  });

  it('maps fund balances', async () => {
    const funds = await repo.getFundBalances();
    expect(funds[0]).toEqual({ id: 'f1', name: 'General', balance: 25 });
  });
});
