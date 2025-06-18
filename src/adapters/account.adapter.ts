import 'reflect-metadata';
import { injectable } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Account } from '../models/account.model';
import { logAuditEvent } from '../utils/auditLogger';
import { supabase } from '../lib/supabase';

@injectable()
export class AccountAdapter extends BaseAdapter<Account> {
  protected tableName = 'accounts';
  
  protected defaultSelect = `
    id,
    name,
    account_type,
    account_number,
    description,
    email,
    phone,
    address,
    website,
    tax_id,
    is_active,
    notes,
    member_id,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [
    {
      table: 'members',
      foreignKey: 'member_id',
      select: ['id', 'first_name', 'last_name', 'email', 'contact_number']
    }
  ];

  protected override async onBeforeCreate(data: Partial<Account>): Promise<Partial<Account>> {
    // Validate account data
    this.validateAccountData(data);
    
    // Set default values
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    
    return data;
  }

  protected override async onAfterCreate(data: Account): Promise<void> {
    // Log audit event
    await logAuditEvent('create', 'account', data.id, data);
  }

  protected override async onBeforeUpdate(id: string, data: Partial<Account>): Promise<Partial<Account>> {
    // Validate account data if fields are being updated
    if (data.name || data.account_number || data.email) {
      this.validateAccountData(data);
    }
    
    return data;
  }

  protected override async onAfterUpdate(data: Account): Promise<void> {
    // Log audit event
    await logAuditEvent('update', 'account', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    // Check for financial transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('account_id', id)
      .limit(1);

    if (transactionsError) throw transactionsError;
    if (transactions?.length) {
      throw new Error('Cannot delete account with existing financial transactions');
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    // Log audit event
    await logAuditEvent('delete', 'account', id, { id });
  }

  private validateAccountData(data: Partial<Account>): void {
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Account name is required');
    }
    
    if (data.account_number !== undefined && !data.account_number.trim()) {
      throw new Error('Account number is required');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Invalid email format');
    }
  }
}