import { injectable, inject } from 'inversify';
import type { IFinanceDashboardAdapter } from '../adapters/financeDashboard.adapter';
import { TYPES } from '../lib/types';
import { MonthlyTrend, FinanceStats, FundBalance } from '../models/financeDashboard.model';

export interface IFinanceDashboardRepository {
  getMonthlyTrends(): Promise<MonthlyTrend[]>;
  getMonthlyStats(): Promise<FinanceStats | null>;
  getFundBalances(): Promise<FundBalance[]>;
}

@injectable()
export class FinanceDashboardRepository implements IFinanceDashboardRepository {
  constructor(
    @inject(TYPES.IFinanceDashboardAdapter)
    private adapter: IFinanceDashboardAdapter,
  ) {}

  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    const rows = await this.adapter.fetchMonthlyTrends();
    return rows.map((r: any) => ({
      month: new Date(`${r.month}-01`).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      income: Number(r.income),
      expenses: Number(r.expenses),
      percentageChange: r.percentage_change !== null ? Number(r.percentage_change) : null,
    }));
  }

  async getMonthlyStats(): Promise<FinanceStats | null> {
    const row = await this.adapter.fetchMonthlyStats();
    if (!row) return null;
    return {
      monthlyIncome: Number(row.monthly_income),
      monthlyExpenses: Number(row.monthly_expenses),
      activeBudgets: Number(row.active_budgets),
      incomeByCategory: row.income_by_category || {},
      expensesByCategory: row.expenses_by_category || {},
    };
  }

  async getFundBalances(): Promise<FundBalance[]> {
    const rows = await this.adapter.fetchFundBalances();
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      balance: Number(r.balance),
    }));
  }
}
