import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { IncomeTransaction } from '../models/incomeTransaction.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface IIncomeTransactionAdapter extends BaseAdapter<IncomeTransaction> {}

@injectable()
export class IncomeTransactionAdapter
  extends BaseAdapter<IncomeTransaction>
  implements IIncomeTransactionAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'income_transactions';

  protected defaultSelect = `
    id,
    transaction_date,
    amount,
    description,
    reference,
    member_id,
    category_id,
    fund_id,
    source_id,
    account_id,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    { table: 'members', foreignKey: 'member_id', select: ['id','first_name','last_name','email'] },
    { table: 'categories', foreignKey: 'category_id', select: ['id','code','name'] },
    { table: 'funds', foreignKey: 'fund_id', select: ['id','name','type'] },
    { table: 'financial_sources', foreignKey: 'source_id', select: ['id','name','source_type'] },
    { table: 'accounts', foreignKey: 'account_id', select: ['id','name'] }
  ];

  protected override async onAfterCreate(data: IncomeTransaction): Promise<void> {
    await this.auditService.logAuditEvent('create', 'income_transaction', data.id, data);
  }

  protected override async onAfterUpdate(data: IncomeTransaction): Promise<void> {
    await this.auditService.logAuditEvent('update', 'income_transaction', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'income_transaction', id, { id });
  }
}
