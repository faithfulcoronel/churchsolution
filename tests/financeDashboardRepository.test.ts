import { describe, it, expect } from 'vitest';
import { FinanceDashboardRepository } from '../src/repositories/financeDashboard.repository';
import type { IFinanceDashboardAdapter } from '../src/adapters/financeDashboard.adapter';

const adapter: IFinanceDashboardAdapter = {
  fetchMonthlyTrends: async () => [
    { month: '2025-06', income: '100', expenses: '50', percentage_change: '10' },
  ],
  fetchMonthlyStats: async () => ({
    monthly_income: '100',
    monthly_expenses: '50',
    active_budgets: 2,
    income_by_category: { Tithe: 100 },
    expenses_by_category: { Utilities: 50 },
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
    const stats = await repo.getMonthlyStats();
    expect(stats).toEqual({
      monthlyIncome: 100,
      monthlyExpenses: 50,
      activeBudgets: 2,
      incomeByCategory: { Tithe: 100 },
      expensesByCategory: { Utilities: 50 },
    });
  });

  it('maps fund balances', async () => {
    const funds = await repo.getFundBalances();
    expect(funds[0]).toEqual({ id: 'f1', name: 'General', balance: 25 });
  });
});
