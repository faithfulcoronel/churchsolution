import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { LicenseFeature } from '../models/licenseFeature.model';
import type { ILicenseFeatureAdapter } from '../adapters/licenseFeature.adapter';
import { LicenseFeatureValidator } from '../validators/licenseFeature.validator';
import { NotificationService } from '../services/NotificationService';

export interface ILicenseFeatureRepository extends BaseRepository<LicenseFeature> {}

@injectable()
export class LicenseFeatureRepository
  extends BaseRepository<LicenseFeature>
  implements ILicenseFeatureRepository
{
  constructor(@inject('ILicenseFeatureAdapter') adapter: ILicenseFeatureAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<LicenseFeature>): Promise<Partial<LicenseFeature>> {
    LicenseFeatureValidator.validate(data);
    return data;
  }

  protected override async beforeUpdate(id: string, data: Partial<LicenseFeature>): Promise<Partial<LicenseFeature>> {
    LicenseFeatureValidator.validate(data);
    return data;
  }

  protected override async afterCreate(data: LicenseFeature): Promise<void> {
    NotificationService.showSuccess('License feature created successfully');
  }

  protected override async afterUpdate(data: LicenseFeature): Promise<void> {
    NotificationService.showSuccess('License feature updated successfully');
  }
}
