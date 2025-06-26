import 'reflect-metadata';
import { injectable } from 'inversify';
import { supabase } from '../lib/supabase';

@injectable()
export class FinanceDashboardAdapter {
  async fetchMonthlyTrends() {
    const { data, error } = await supabase
      .from('finance_monthly_trends')
      .select('*')
      .order('month');
    if (error) throw error;
    return data || [];
  }

  async fetchMonthlyStats() {
    const { data, error } = await supabase
      .from('finance_monthly_stats')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async fetchFundBalances() {
    const { data, error } = await supabase
      .from('fund_balances_view')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }
}

export interface IFinanceDashboardAdapter extends FinanceDashboardAdapter {}
