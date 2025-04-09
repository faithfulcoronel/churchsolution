import { BaseModel } from './base.model';

export interface Notification extends BaseModel {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
}