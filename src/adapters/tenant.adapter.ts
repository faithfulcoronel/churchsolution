import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Tenant } from '../models/tenant.model';
import { AuditService } from '../services/AuditService';
import { TYPES } from '../lib/types';

export interface ITenantAdapter extends BaseAdapter<Tenant> {}

@injectable()
export class TenantAdapter
  extends BaseAdapter<Tenant>
  implements ITenantAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'tenants';

  protected defaultSelect = `
    id,
    name,
    subdomain,
    address,
    contact_number,
    email,
    website,
    logo_url,
    status,
    subscription_tier,
    subscription_status,
    subscription_end_date,
    created_by,
    created_at,
    updated_at
  `;

  protected defaultRelationships: QueryOptions['relationships'] = [];

  protected override async onAfterCreate(data: Tenant): Promise<void> {
    await this.auditService.logAuditEvent('create', 'tenant', data.id, data);
  }

  protected override async onAfterUpdate(data: Tenant): Promise<void> {
    await this.auditService.logAuditEvent('update', 'tenant', data.id, data);
  }
}
