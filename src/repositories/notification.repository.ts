import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Notification } from '../models/notification.model';
import type { INotificationAdapter } from '../adapters/notification.adapter';
import { NotificationValidator } from '../validators/notification.validator';

export interface INotificationRepository extends BaseRepository<Notification> {}

@injectable()
export class NotificationRepository
  extends BaseRepository<Notification>
  implements INotificationRepository
{
  constructor(@inject('INotificationAdapter') adapter: INotificationAdapter) {
    super(adapter);
  }

  async markAsRead(id: string): Promise<void> {
    await (this.adapter as INotificationAdapter).markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await (this.adapter as INotificationAdapter).markAllAsRead(userId);
  }

  async deleteExpired(): Promise<void> {
    await (this.adapter as INotificationAdapter).deleteExpired();
  }

  protected override async beforeCreate(data: Partial<Notification>): Promise<Partial<Notification>> {
    // Validate notification data
    NotificationValidator.validate(data);

    // Set default expiration if not provided
    if (!data.expires_at) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days default
      data.expires_at = expirationDate.toISOString();
    }

    return data;
  }
}