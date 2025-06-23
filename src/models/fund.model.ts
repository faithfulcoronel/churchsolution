import { BaseModel } from './base.model';
import type { ChartOfAccount } from './chartOfAccount.model';

export type FundType = 'restricted' | 'unrestricted';

export interface Fund extends BaseModel {
  id: string;
  name: string;
  type: FundType;
  account_id: string | null;
  account?: Pick<ChartOfAccount, 'id' | 'code' | 'name'>;
}
