import 'reflect-metadata';
import { injectable } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Notification } from '../models/notification.model';
import { supabase } from '../lib/supabase';

export interface INotificationAdapter extends BaseAdapter<Notification> {
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

@injectable()
export class NotificationAdapter
  extends BaseAdapter<Notification>
  implements INotificationAdapter
{
  protected tableName = 'notifications';
  
  protected defaultSelect = `
    id,
    user_id,
    title,
    message,
    type,
    is_read,
    action_type,
    action_payload,
    created_at,
    tenant_id
  `;

  public async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  public async deleteExpired(): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  }

  protected override async buildSecureQuery(options: QueryOptions = {}): Promise<any> {
    const { query } = await super.buildSecureQuery(options);
    
    // Add user_id filter if not already present
    if (!options.filters?.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query.eq('user_id', user.id);
      }
    }

    return { query };
  }
}