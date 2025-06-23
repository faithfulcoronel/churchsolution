import { BaseModel } from './base.model';

export type FundType = 'restricted' | 'unrestricted';

export interface Fund extends BaseModel {
  id: string;
  name: string;
  type: FundType;
}
