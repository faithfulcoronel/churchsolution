import { BaseModel } from './base.model';
import { Member } from './member.model';
import { Fund } from './fund.model';
import { FinancialSource } from './financialSource.model';
import { Account } from './account.model';

export interface IncomeTransaction extends BaseModel {
  id: string;
  transaction_date: string;
  amount: number;
  description: string;
  reference: string | null;
  member_id: string | null;
  member?: Member;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  fund_id: string | null;
  fund?: Fund;
  source_id: string | null;
  source?: FinancialSource;
  account_id: string | null;
  account?: Account;
}
