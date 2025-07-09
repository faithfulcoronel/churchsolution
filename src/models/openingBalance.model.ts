import { BaseModel } from './base.model';

export type OpeningBalanceStatus = 'pending' | 'posted';
export type OpeningBalanceSource = 'manual' | 'rollover';

export interface OpeningBalance extends BaseModel {
  id: string;
  fiscal_year_id: string;
  fund_id: string;
  amount: number;
  source: OpeningBalanceSource;
  status: OpeningBalanceStatus;
  posted_at: string | null;
  posted_by: string | null;
  fiscal_year?: { id: string; name: string };
  fund?: { id: string; name: string; code: string };
}
