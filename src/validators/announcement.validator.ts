import { Announcement } from '../models/announcement.model';

export class AnnouncementValidator {
  static validate(data: Partial<Announcement>): void {
    if (data.message !== undefined && !data.message.trim()) {
      throw new Error('Message is required');
    }
    if (data.starts_at && isNaN(Date.parse(data.starts_at))) {
      throw new Error('Invalid start date');
    }
    if (data.ends_at && isNaN(Date.parse(data.ends_at))) {
      throw new Error('Invalid end date');
    }
    if (
      data.starts_at &&
      data.ends_at &&
      Date.parse(data.ends_at) < Date.parse(data.starts_at)
    ) {
      throw new Error('End date must be after start date');
    }
  }
}
