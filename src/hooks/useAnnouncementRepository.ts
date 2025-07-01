import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IAnnouncementRepository } from '../repositories/announcement.repository';
import { useBaseRepository } from './useBaseRepository';

export function useAnnouncementRepository() {
  const repository = container.get<IAnnouncementRepository>(TYPES.IAnnouncementRepository);
  return useBaseRepository(repository, 'Announcement', 'announcements');
}
