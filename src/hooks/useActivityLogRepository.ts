import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IActivityLogRepository } from '../repositories/activityLog.repository';
import { useBaseRepository } from './useBaseRepository';

export function useActivityLogRepository() {
  const repository = container.get<IActivityLogRepository>(TYPES.IActivityLogRepository);
  return useBaseRepository(repository, 'Activity Log', 'activity_logs');
}
