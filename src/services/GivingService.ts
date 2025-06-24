import { injectable, inject } from 'inversify';
import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import { TYPES } from '../lib/types';
import { supabase } from '../lib/supabase';

export interface GivingLine {
  member_id: string | null;
  fund_id: string | null;
  category_id: string | null;
  source_id: string | null;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
  batch_id?: string | null;
}

@injectable()
export class GivingService {
  constructor(
    @inject(TYPES.IFinancialTransactionHeaderRepository)
    private headerRepo: IFinancialTransactionHeaderRepository,
  ) {}

  private buildTransactions(
    header: Partial<FinancialTransactionHeader>,
    lines: GivingLine[],
  ) {
    return lines.flatMap((line) => {
      const base = {
        member_id: line.member_id,
        fund_id: line.fund_id,
        source_id: line.source_id,
        category_id: line.category_id,
        date: header.transaction_date!,
        description: header.description || '',
        batch_id: line.batch_id ?? null,
      };
      return [
        {
          ...base,
          account_id: line.source_account_id,
          debit: line.amount,
          credit: 0,
        },
        {
          ...base,
          account_id: line.category_account_id,
          debit: 0,
          credit: line.amount,
        },
      ];
    });
  }

  public async createGivingBatch(
    header: Partial<FinancialTransactionHeader>,
    lines: GivingLine[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    const result = await this.headerRepo.createWithTransactions(header, transactions);

    const batchIds = Array.from(
      new Set(transactions.map((t) => t.batch_id).filter((b) => b))
    );
    for (const id of batchIds) {
      await supabase.rpc('refresh_offering_batch_total', { p_batch_id: id });
    }

    return result;
  }

  public async updateGivingBatch(
    id: string,
    header: Partial<FinancialTransactionHeader>,
    lines: GivingLine[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    const result = await this.headerRepo.updateWithTransactions(id, header, transactions);

    const batchIds = Array.from(
      new Set(transactions.map((t) => t.batch_id).filter((b) => b))
    );
    for (const bid of batchIds) {
      await supabase.rpc('refresh_offering_batch_total', { p_batch_id: bid });
    }

    return result;
  }
}
