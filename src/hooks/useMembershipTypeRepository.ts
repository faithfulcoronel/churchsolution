import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMembershipTypeRepository } from '../repositories/membershipType.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMembershipTypeRepository() {
  const repository = container.get<IMembershipTypeRepository>(TYPES.IMembershipTypeRepository);
  return useBaseRepository(repository, 'Membership Type', 'membership_type');
}
