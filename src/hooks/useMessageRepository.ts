import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IMessageRepository } from '../repositories/message.repository';
import { useBaseRepository } from './useBaseRepository';

export function useMessageRepository() {
  const repository = container.get<IMessageRepository>(TYPES.IMessageRepository);
  return useBaseRepository(repository, 'Message', 'messages');
}
