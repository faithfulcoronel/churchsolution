import 'reflect-metadata';
import { injectable } from 'inversify';
import { supabase } from '../lib/supabase';
import { tenantUtils } from '../utils/tenantUtils';

@injectable()
export class SourceRecentTransactionAdapter {
  async fetchRecent(accountId: string, limit = 5) {
    const tenantId = await tenantUtils.getTenantId();
    if (!tenantId) throw new Error('No tenant context found');

    const { data, error } = await supabase
      .from('source_recent_transactions_view')
      .select(
        `
          header_id,
          source_id,
          account_id,
          date,
          category,
          description,
          amount
        `
      )
      .eq('account_id', accountId)
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export interface ISourceRecentTransactionAdapter
  extends SourceRecentTransactionAdapter {}
