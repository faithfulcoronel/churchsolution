import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Fund } from '../models/fund.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';

export interface IFundAdapter extends BaseAdapter<Fund> {}

@injectable()
export class FundAdapter
  extends BaseAdapter<Fund>
  implements IFundAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'funds';

  protected defaultSelect = `
    id,
    name,
    type,
    account_id,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    {
      table: 'chart_of_accounts',
      foreignKey: 'account_id',
      select: ['id', 'code', 'name']
    }
  ];

  protected override async onAfterCreate(data: Fund): Promise<void> {
    await this.auditService.logAuditEvent('create', 'fund', data.id, data);
  }

  protected override async onAfterUpdate(data: Fund): Promise<void> {
    await this.auditService.logAuditEvent('update', 'fund', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    const { data: tx, error } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('fund_id', id)
      .limit(1);
    if (error) throw error;
    if (tx?.length) {
      throw new Error('Cannot delete fund with existing financial transactions');
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'fund', id, { id });
  }
}
