import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ILicensePlanRepository } from '../repositories/licensePlan.repository';
import { useBaseRepository } from './useBaseRepository';

export function useLicensePlanRepository() {
  const repository = container.get<ILicensePlanRepository>(TYPES.ILicensePlanRepository);
  return useBaseRepository(repository, 'LicensePlan', 'license-plans');
}
