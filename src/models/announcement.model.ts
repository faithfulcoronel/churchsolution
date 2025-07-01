import { BaseModel } from './base.model';

export interface Announcement extends BaseModel {
  id: string;
  tenant_id: string;
  message: string;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
}
