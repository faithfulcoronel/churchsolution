import { container, TYPES } from '../lib/container';
import type { IMemberRepository } from '../repositories/member.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMemberRepository() {
  const repository = container.get<IMemberRepository>(TYPES.IMemberRepository);
  return useBaseRepository(repository, 'Member', 'members');
}