import { container } from '../lib/container';
import { MemberRepository } from '../repositories/member.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMemberRepository() {
  const repository = container.get(MemberRepository);
  return useBaseRepository(repository, 'Member', 'members');
}