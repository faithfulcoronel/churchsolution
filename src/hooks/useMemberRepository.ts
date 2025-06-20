import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMemberRepository } from '../repositories/member.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMemberRepository() {
  const repository = container.get<IMemberRepository>(TYPES.IMemberRepository);
  return useBaseRepository(repository, 'Member', 'members');
}