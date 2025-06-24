import { BaseModel } from './base.model';
import { ChartOfAccount } from './chartOfAccount.model';

export type CategoryType =
  | 'membership'
  | 'member_status'
  | 'income_transaction'
  | 'expense_transaction'
  | 'budget'
  | 'relationship_type';

export interface Category extends BaseModel {
  id: string;
  type: CategoryType;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  chart_of_account_id: string | null;
  chart_of_accounts?: ChartOfAccount;
}
