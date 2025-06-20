import { container } from '../lib/container';
import type { INotificationRepository } from '../repositories/notification.repository';
import { useBaseRepository } from './useBaseRepository';

export function useNotificationRepository() {
  const repository = container.get<INotificationRepository>('INotificationRepository');
  return useBaseRepository(repository, 'Notification', 'notifications');
}