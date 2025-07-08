import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ILicenseRepository } from '../repositories/license.repository';
import { useBaseRepository } from './useBaseRepository';

export function useLicenseRepository() {
  const repository = container.get<ILicenseRepository>(TYPES.ILicenseRepository);
  return useBaseRepository(repository, 'License', 'licenses');
}
