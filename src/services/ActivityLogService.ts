import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IActivityLogRepository } from '../repositories/activityLog.repository';
import type { ActivityLog } from '../models/activityLog.model';
import { QueryOptions } from '../adapters/base.adapter';

export interface ActivityLogService {
  getRecentActivity(limit?: number, options?: Omit<QueryOptions, 'pagination'>): Promise<ActivityLog[]>;
}

@injectable()
export class SupabaseActivityLogService implements ActivityLogService {
  constructor(
    @inject(TYPES.IActivityLogRepository)
    private repo: IActivityLogRepository,
  ) {}

  async getRecentActivity(limit = 5, options: Omit<QueryOptions, 'pagination'> = {}) {
    const { data } = await this.repo.find({
      ...options,
      order: { column: 'created_at', ascending: false },
      pagination: { page: 1, pageSize: limit },
    });
    return data ?? [];
  }
}
