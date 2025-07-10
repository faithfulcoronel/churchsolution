import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { LicensePlan } from '../models/licensePlan.model';
import type { ILicensePlanAdapter } from '../adapters/licensePlan.adapter';
import { NotificationService } from '../services/NotificationService';

export interface ILicensePlanRepository extends BaseRepository<LicensePlan> {}

@injectable()
export class LicensePlanRepository
  extends BaseRepository<LicensePlan>
  implements ILicensePlanRepository
{
  constructor(@inject('ILicensePlanAdapter') adapter: ILicensePlanAdapter) {
    super(adapter);
  }

  protected override async afterCreate(data: LicensePlan): Promise<void> {
    NotificationService.showSuccess(
      `License plan "${data.name}" created successfully`
    );
  }

  protected override async afterUpdate(data: LicensePlan): Promise<void> {
    NotificationService.showSuccess(
      `License plan "${data.name}" updated successfully`
    );
  }
}
