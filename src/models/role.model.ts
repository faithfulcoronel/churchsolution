import { BaseModel } from './base.model';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

export interface Role extends BaseModel {
  id: string;
  name: string;
  description: string | null;
  permissions?: { permission: Permission }[];
}
