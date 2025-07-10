import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ITenantRepository } from '../repositories/tenant.repository';
import { useBaseRepository } from './useBaseRepository';

export function useTenantRepository() {
  const repository = container.get<ITenantRepository>(TYPES.ITenantRepository);
  return useBaseRepository(repository, 'Tenant', 'tenants');
}
