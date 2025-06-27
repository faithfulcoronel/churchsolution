import { BaseModel } from './base.model';

export type FundType = 'restricted' | 'unrestricted';

export interface Fund extends BaseModel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: FundType;
}
