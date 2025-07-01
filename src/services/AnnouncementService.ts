import { injectable, inject } from 'inversify';
import type { IAnnouncementRepository } from '../repositories/announcement.repository';
import type { Announcement } from '../models/announcement.model';
import { TYPES } from '../lib/types';

export interface AnnouncementService {
  getActiveAnnouncements(): Promise<Announcement[]>;
}

@injectable()
export class SupabaseAnnouncementService implements AnnouncementService {
  constructor(
    @inject(TYPES.IAnnouncementRepository)
    private repo: IAnnouncementRepository,
  ) {}

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const { data } = await this.repo.find({
      filters: { active: { operator: 'eq', value: true } },
      order: { column: 'starts_at', ascending: true },
    });
    return data ?? [];
  }
}
