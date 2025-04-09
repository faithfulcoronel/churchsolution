import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Notification } from '../models/notification.model';
import { NotificationAdapter } from '../adapters/notification.adapter';

@injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(@inject(NotificationAdapter) adapter: NotificationAdapter) {
    super(adapter);
  }

  async markAsRead(id: string): Promise<void> {
    await (this.adapter as NotificationAdapter).markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await (this.adapter as NotificationAdapter).markAllAsRead(userId);
  }

  async deleteExpired(): Promise<void> {
    await (this.adapter as NotificationAdapter).deleteExpired();
  }

  protected override async beforeCreate(data: Partial<Notification>): Promise<Partial<Notification>> {
    // Set default expiration if not provided
    if (!data.expires_at) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days default
      data.expires_at = expirationDate.toISOString();
    }

    return data;
  }
}