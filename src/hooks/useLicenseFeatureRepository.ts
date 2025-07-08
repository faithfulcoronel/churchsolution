import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ILicenseFeatureRepository } from '../repositories/licenseFeature.repository';
import { useBaseRepository } from './useBaseRepository';

export function useLicenseFeatureRepository() {
  const repository = container.get<ILicenseFeatureRepository>(TYPES.ILicenseFeatureRepository);
  return useBaseRepository(repository, 'License Feature', 'license_features');
}
