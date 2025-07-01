import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAnnouncementService } from '../src/services/AnnouncementService';
import type { IAnnouncementRepository } from '../src/repositories/announcement.repository';

const repo: IAnnouncementRepository = {
  find: vi.fn().mockResolvedValue({ data: [], count: 0 }),
} as unknown as IAnnouncementRepository;

const service = new SupabaseAnnouncementService(repo);

describe('AnnouncementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches active announcements', async () => {
    await service.getActiveAnnouncements();
    expect(repo.find).toHaveBeenCalledWith({
      filters: { active: { operator: 'eq', value: true } },
      order: { column: 'starts_at', ascending: true },
    });
  });
});
