import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Announcement } from '../models/announcement.model';
import type { IAnnouncementAdapter } from '../adapters/announcement.adapter';
import { AnnouncementValidator } from '../validators/announcement.validator';

export interface IAnnouncementRepository extends BaseRepository<Announcement> {}

@injectable()
export class AnnouncementRepository
  extends BaseRepository<Announcement>
  implements IAnnouncementRepository
{
  constructor(@inject('IAnnouncementAdapter') adapter: IAnnouncementAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<Announcement>
  ): Promise<Partial<Announcement>> {
    AnnouncementValidator.validate(data);
    return this.formatData(data);
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<Announcement>
  ): Promise<Partial<Announcement>> {
    AnnouncementValidator.validate(data);
    return this.formatData(data);
  }

  private formatData(data: Partial<Announcement>): Partial<Announcement> {
    return {
      ...data,
      message: data.message?.trim(),
    };
  }
}
