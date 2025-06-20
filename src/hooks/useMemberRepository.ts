import { container } from '../lib/container';
import type { IMemberRepository } from '../repositories/member.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMemberRepository() {
  const repository = container.get<IMemberRepository>('IMemberRepository');
  return useBaseRepository(repository, 'Member', 'members');
}