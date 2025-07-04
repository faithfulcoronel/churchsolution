import { BaseModel } from './base.model';

export interface Setting extends BaseModel {
  id: string;
  tenant_id?: string | null;
  user_id?: string | null;
  key: string;
  value: string;
}
