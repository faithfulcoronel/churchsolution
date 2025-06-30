import { BaseModel } from './base.model';
import { Permission } from './permission.model';

export interface Role extends BaseModel {
  id: string;
  name: string;
  description: string | null;
  permissions?: { permission: Permission }[];
}
