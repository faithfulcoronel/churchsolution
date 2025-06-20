import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { FinancialSource } from '../models/financialSource.model';
import { AuditService, SupabaseAuditService } from '../services/AuditService';
import { supabase } from '../lib/supabase';

export interface IFinancialSourceAdapter extends BaseAdapter<FinancialSource> {}

@injectable()
export class FinancialSourceAdapter
  extends BaseAdapter<FinancialSource>
  implements IFinancialSourceAdapter
{
  constructor(@inject(SupabaseAuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'financial_sources';
  
  protected defaultSelect = `
    id,
    name,
    description,
    source_type,
    account_number,
    is_active,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected override async onBeforeCreate(data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Set default values
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    
    return data;
  }

  protected override async onAfterCreate(data: FinancialSource): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('create', 'financial_source', data.id, data);
  }

  protected override async onBeforeUpdate(id: string, data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Repositories handle validation
    return data;
  }

  protected override async onAfterUpdate(data: FinancialSource): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('update', 'financial_source', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    // Check for financial transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('source_id', id)
      .limit(1);

    if (transactionsError) throw transactionsError;
    if (transactions?.length) {
      throw new Error('Cannot delete source with existing financial transactions');
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('delete', 'financial_source', id, { id });
  }

}