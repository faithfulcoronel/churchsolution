import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { INotificationRepository } from '../repositories/notification.repository';
import { useBaseRepository } from './useBaseRepository';

export function useNotificationRepository() {
  const repository = container.get<INotificationRepository>(TYPES.INotificationRepository);
  return useBaseRepository(repository, 'Notification', 'notifications');
}