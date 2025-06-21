import { BaseModel } from './base.model';

export type SourceType = 'bank' | 'fund' | 'wallet' | 'cash' | 'online' | 'other';

export interface FinancialSource extends BaseModel {
  id: string;
  name: string;
  description: string | null;
  source_type: SourceType;
  account_number: string | null;
  is_active: boolean;
}