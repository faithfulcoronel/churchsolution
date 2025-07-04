import 'reflect-metadata';
import { injectable } from 'inversify';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';
import { format } from 'date-fns';

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

  async fetchMonthlyStats(startDate: Date, endDate: Date) {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase.rpc('finance_monthly_stats', {
      p_tenant_id: tenantId,
      p_start_date: format(startDate, 'yyyy-MM-dd'),
      p_end_date: format(endDate, 'yyyy-MM-dd'),
    });
    if (error) throw error;
    return data?.[0] || null;
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
