import { injectable, inject } from 'inversify';
import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import { TYPES } from '../lib/types';

export interface ExpenseLine {
  accounts_account_id: string | null;
  fund_id: string | null;
  category_id: string | null;
  source_id: string | null;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
}

@injectable()
export class ExpenseService {
  constructor(
    @inject(TYPES.IFinancialTransactionHeaderRepository)
    private headerRepo: IFinancialTransactionHeaderRepository,
  ) {}

  private buildTransactions(
    header: Partial<FinancialTransactionHeader>,
    lines: ExpenseLine[],
  ) {
    return lines.flatMap((line) => {
      const base = {
        accounts_account_id: line.accounts_account_id,
        fund_id: line.fund_id,
        source_id: line.source_id,
        category_id: line.category_id,
        date: header.transaction_date!,
        description: header.description || '',
      };
      return [
        {
          ...base,
          account_id: line.category_account_id,
          debit: line.amount,
          credit: 0,
        },
        {
          ...base,
          account_id: line.source_account_id,
          debit: 0,
          credit: line.amount,
        },
      ];
    });
  }

  public async createExpenseBatch(
    header: Partial<FinancialTransactionHeader>,
    lines: ExpenseLine[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    return this.headerRepo.createWithTransactions(header, transactions);
  }

  public async updateExpenseBatch(
    id: string,
    header: Partial<FinancialTransactionHeader>,
    lines: ExpenseLine[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    return this.headerRepo.updateWithTransactions(id, header, transactions);
  }
}
