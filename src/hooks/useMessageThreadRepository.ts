import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMessageThreadRepository } from '../repositories/messageThread.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMessageThreadRepository() {
  const repository = container.get<IMessageThreadRepository>(TYPES.IMessageThreadRepository);
  return useBaseRepository(repository, 'Message Thread', 'message-threads');
}
