import 'reflect-metadata';
import { injectable } from 'inversify';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';

@injectable()
export class FundBalanceAdapter {
  async fetchBalance(fundId: string) {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) throw new Error('No tenant context found');

    const { data, error } = await supabase
      .from('fund_balances_view')
      .select('balance')
      .eq('tenant_id', tenantId)
      .eq('id', fundId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export interface IFundBalanceAdapter extends FundBalanceAdapter {}
