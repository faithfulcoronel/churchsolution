import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseActivityLogService } from '../src/services/ActivityLogService';
import type { IActivityLogRepository } from '../src/repositories/activityLog.repository';

const repo: IActivityLogRepository = {
  find: vi.fn().mockResolvedValue({ data: [], count: 0 })
} as unknown as IActivityLogRepository;

const service = new SupabaseActivityLogService(repo);

describe('ActivityLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches recent activity', async () => {
    await service.getRecentActivity(5);
    expect(repo.find).toHaveBeenCalledWith({
      order: { column: 'created_at', ascending: false },
      pagination: { page: 1, pageSize: 5 },
    });
  });
});
