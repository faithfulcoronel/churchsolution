import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { AuditService, SupabaseAuditService } from '../services/AuditService';
import { supabase } from '../lib/supabase';

@injectable()
export class FinancialTransactionHeaderAdapter extends BaseAdapter<FinancialTransactionHeader> {
  constructor(@inject(SupabaseAuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'financial_transaction_headers';
  
  protected defaultSelect = `
    id,
    transaction_number,
    transaction_date,
    description,
    reference,
    source_id,
    status,
    posted_at,
    posted_by,
    voided_at,
    voided_by,
    void_reason,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    {
      table: 'financial_sources',
      foreignKey: 'source_id',
      select: ['id', 'name', 'source_type']
    }
  ];

  protected override async onBeforeCreate(data: Partial<FinancialTransactionHeader>): Promise<Partial<FinancialTransactionHeader>> {
    // Set default values
    if (!data.status) {
      data.status = 'draft';
    }
    
    // Generate transaction number if not provided
    if (!data.transaction_number) {
      data.transaction_number = await this.generateTransactionNumber(
        data.transaction_date || new Date().toISOString().split('T')[0],
        data.status === 'draft' ? 'DFT' : 'TRX'
      );
    }
    
    return data;
  }

  protected override async onAfterCreate(data: FinancialTransactionHeader): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('create', 'financial_transaction_header', data.id, data);
  }

  protected override async onBeforeUpdate(id: string, data: Partial<FinancialTransactionHeader>): Promise<Partial<FinancialTransactionHeader>> {
    // Get current header data
    const { data: currentHeader, error } = await supabase
      .from(this.tableName)
      .select('status')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Validate status changes
    if (data.status && currentHeader) {
      if (currentHeader.status === 'posted' && data.status === 'draft') {
        throw new Error('Cannot change status from posted to draft');
      }
      
      if (currentHeader.status === 'voided' && data.status !== 'voided') {
        throw new Error('Cannot change status of a voided transaction');
      }
      
      // If changing to posted, set posted_at and posted_by
      if (data.status === 'posted' && currentHeader.status !== 'posted') {
        data.posted_at = new Date().toISOString();
        const { data: { user } } = await supabase.auth.getUser();
        data.posted_by = user?.id;
      }
      
      // If changing to voided, set voided_at and voided_by
      if (data.status === 'voided' && currentHeader.status !== 'voided') {
        data.voided_at = new Date().toISOString();
        const { data: { user } } = await supabase.auth.getUser();
        data.voided_by = user?.id;
        
        // Require void reason
        if (!data.void_reason) {
          throw new Error('Void reason is required when voiding a transaction');
        }
      }
    }
    
    return data;
  }

  protected override async onAfterUpdate(data: FinancialTransactionHeader): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('update', 'financial_transaction_header', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    // Check if header has transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('header_id', id)
      .limit(1);

    if (transactionsError) throw transactionsError;
    if (transactions?.length) {
      throw new Error('Cannot delete header with existing transactions');
    }
    
    // Check if header is posted or voided
    const { data: header, error: headerError } = await supabase
      .from(this.tableName)
      .select('status')
      .eq('id', id)
      .single();
    
    if (headerError) throw headerError;
    if (header && (header.status === 'posted' || header.status === 'voided')) {
      throw new Error(`Cannot delete a ${header.status} transaction`);
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    // Log audit event
    await this.auditService.logAuditEvent('delete', 'financial_transaction_header', id, { id });
  }


  private async generateTransactionNumber(date: string, prefix: string): Promise<string> {
    // Format: PREFIX-YYYYMM-SEQUENCE
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    // Get current sequence for this month
    const { data, error } = await supabase
      .from(this.tableName)
      .select('transaction_number')
      .ilike('transaction_number', `${prefix}-${year}${month}-%`)
      .order('transaction_number', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].transaction_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = isNaN(lastSequence) ? 1 : lastSequence + 1;
    }
    
    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  public async postTransaction(id: string): Promise<void> {
    const { error } = await supabase.rpc('post_transaction', {
      p_header_id: id,
      p_user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) throw error;
  }

  public async voidTransaction(id: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('void_transaction', {
      p_header_id: id,
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_reason: reason
    });
    
    if (error) throw error;
  }

  public async getTransactionEntries(headerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        id,
        type,
        amount,
        description,
        date,
        debit,
        credit,
        account_id,
        account:chart_of_accounts(id, code, name, account_type)
      `)
      .eq('header_id', headerId)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  }

  public async isTransactionBalanced(headerId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_transaction_balanced', {
      p_header_id: headerId
    });
    
    if (error) throw error;
    return data;
  }
}