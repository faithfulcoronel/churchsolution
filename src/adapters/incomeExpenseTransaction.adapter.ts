import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { IncomeExpenseTransaction } from '../models/incomeExpenseTransaction.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface IIncomeExpenseTransactionAdapter extends BaseAdapter<IncomeExpenseTransaction> {}

@injectable()
export class IncomeExpenseTransactionAdapter
  extends BaseAdapter<IncomeExpenseTransaction>
  implements IIncomeExpenseTransactionAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'income_expense_transactions';

  protected defaultSelect = `
    id,
    transaction_type,
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

  protected override async onAfterCreate(data: IncomeExpenseTransaction): Promise<void> {
    await this.auditService.logAuditEvent('create', 'income_expense_transaction', data.id, data);
  }

  protected override async onAfterUpdate(data: IncomeExpenseTransaction): Promise<void> {
    await this.auditService.logAuditEvent('update', 'income_expense_transaction', data.id, data);
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'income_expense_transaction', id, { id });
  }
}
