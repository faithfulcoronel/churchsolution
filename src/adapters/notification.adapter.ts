import 'reflect-metadata';
import { injectable } from 'inversify';
import { BaseAdapter, QueryOptions } from './base.adapter';
import { Notification } from '../models/notification.model';
import { supabase } from '../lib/supabase';

@injectable()
export class NotificationAdapter extends BaseAdapter<Notification> {
  protected tableName = 'notifications';
  
  protected defaultSelect = `
    id,
    user_id,
    title,
    message,
    type,
    read,
    action_url,
    action_text,
    metadata,
    expires_at,
    created_at
  `;

  public async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  public async deleteExpired(): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() })
      .lt('expires_at', new Date().toISOString())
      .is('deleted_at', null);

    if (error) throw error;
  }

  protected override async buildSecureQuery(options: QueryOptions = {}): Promise<any> {
    const query = await super.buildSecureQuery(options);
    
    // Add user_id filter if not already present
    if (!options.filters?.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query.eq('user_id', user.id);
      }
    }

    return query;
  }
}