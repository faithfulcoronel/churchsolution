import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Tenant } from '../models/tenant.model';
import type { ITenantAdapter } from '../adapters/tenant.adapter';
import { NotificationService } from '../services/NotificationService';

export interface ITenantRepository extends BaseRepository<Tenant> {}

@injectable()
export class TenantRepository
  extends BaseRepository<Tenant>
  implements ITenantRepository
{
  constructor(@inject('ITenantAdapter') adapter: ITenantAdapter) {
    super(adapter);
  }

  protected override async afterCreate(data: Tenant): Promise<void> {
    NotificationService.showSuccess(`Tenant "${data.name}" created successfully`);
  }

  protected override async afterUpdate(data: Tenant): Promise<void> {
    NotificationService.showSuccess(`Tenant "${data.name}" updated successfully`);
  }
}
