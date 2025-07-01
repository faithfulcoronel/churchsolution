import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMembershipStatusRepository } from '../repositories/membershipStatus.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMembershipStatusRepository() {
  const repository = container.get<IMembershipStatusRepository>(TYPES.IMembershipStatusRepository);
  return useBaseRepository(repository, 'Membership Status', 'membership_status');
}
