export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  percentageChange: number | null;
}

export interface FinanceStats {
  monthlyIncome: number;
  monthlyExpenses: number;
  activeBudgets: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface FundBalance {
  id: string;
  name: string;
  balance: number;
}
