import { container } from '../lib/container';
import { NotificationRepository } from '../repositories/notification.repository';
import { useBaseRepository } from './useBaseRepository';

export function useNotificationRepository() {
  const repository = container.get(NotificationRepository);
  return useBaseRepository(repository, 'Notification', 'notifications');
}