import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { OfferingBatch } from '../models/offeringBatch.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';

export interface IOfferingBatchAdapter extends BaseAdapter<OfferingBatch> {}

@injectable()
export class OfferingBatchAdapter
  extends BaseAdapter<OfferingBatch>
  implements IOfferingBatchAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }
  protected tableName = 'offering_batches';

  protected defaultSelect = `
    id,
    service_description,
    batch_date,
    total_amount,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [];

  protected override async onBeforeCreate(
    data: Partial<OfferingBatch>
  ): Promise<Partial<OfferingBatch>> {
    if (data.total_amount === undefined) {
      data.total_amount = 0;
    }
    return data;
  }

  protected override async onAfterCreate(data: OfferingBatch): Promise<void> {
    await this.auditService.logAuditEvent('create', 'offering_batch', data.id, data);
  }

  protected override async onAfterUpdate(data: OfferingBatch): Promise<void> {
    await this.auditService.logAuditEvent('update', 'offering_batch', data.id, data);
  }

  protected override async onBeforeDelete(id: string): Promise<void> {
    const { data: tx, error } = await supabase
      .from('financial_transactions')
      .select('id')
      .eq('batch_id', id)
      .limit(1);
    if (error) throw error;
    if (tx?.length) {
      throw new Error('Cannot delete batch with existing financial transactions');
    }
  }

  protected override async onAfterDelete(id: string): Promise<void> {
    await this.auditService.logAuditEvent('delete', 'offering_batch', id, { id });
  }
}
