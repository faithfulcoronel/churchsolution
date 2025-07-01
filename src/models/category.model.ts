import { BaseModel } from './base.model';
import { ChartOfAccount } from './chartOfAccount.model';

export type CategoryType =
  | 'membership'
  | 'member_status'
  | 'income_transaction'
  | 'expense_transaction'
  | 'budget'
  | 'relationship_type';

export interface BaseCategory extends BaseModel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  chart_of_account_id: string | null;
  chart_of_accounts?: ChartOfAccount;
}

export interface Category extends BaseCategory {
  // Present for backward compatibility when querying legacy table
  type?: CategoryType;
}

export interface MembershipCategory extends BaseCategory {}
export interface MemberStatusCategory extends BaseCategory {}
export interface IncomeTransactionCategory extends BaseCategory {}
export interface ExpenseTransactionCategory extends BaseCategory {}
export interface BudgetCategory extends BaseCategory {}
export interface RelationshipTypeCategory extends BaseCategory {}
