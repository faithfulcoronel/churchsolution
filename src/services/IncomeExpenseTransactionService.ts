import { injectable, inject } from 'inversify';
import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import type { TransactionType } from '../models/financialTransaction.model';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import type { IIncomeExpenseTransactionRepository } from '../repositories/incomeExpenseTransaction.repository';
import { TYPES } from '../lib/types';

export interface IncomeExpenseEntry {
  transaction_type: TransactionType;
  accounts_account_id: string | null;
  fund_id: string | null;
  category_id: string | null;
  source_id: string | null;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
  batch_id?: string | null;
  member_id?: string | null;
}

@injectable()
export class IncomeExpenseTransactionService {
  constructor(
    @inject(TYPES.IFinancialTransactionHeaderRepository)
    private headerRepo: IFinancialTransactionHeaderRepository,
    @inject(TYPES.IIncomeExpenseTransactionRepository)
    private ieRepo: IIncomeExpenseTransactionRepository,
  ) {}

  private buildTransactions(
    header: Partial<FinancialTransactionHeader>,
    lines: IncomeExpenseEntry[],
  ) {
    return lines.flatMap((line) => {
      const base = {
        accounts_account_id: line.accounts_account_id,
        fund_id: line.fund_id,
        source_id: line.source_id,
        category_id: line.category_id,
        date: header.transaction_date!,
        description: header.description || '',
        batch_id: line.batch_id ?? null,
      } as any;

      if (line.transaction_type === 'income') {
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
      }

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

  private buildEntry(
    header: Partial<FinancialTransactionHeader>,
    line: IncomeExpenseEntry,
    headerId: string,
  ) {
    return {
      transaction_type: line.transaction_type,
      transaction_date: header.transaction_date!,
      amount: line.amount,
      description: header.description || '',
      reference: (header as any).reference ?? null,
      member_id: line.member_id ?? null,
      category_id: line.category_id,
      fund_id: line.fund_id,
      source_id: line.source_id,
      account_id: line.accounts_account_id,
      header_id: headerId,
    };
  }

  public async create(
    header: Partial<FinancialTransactionHeader>,
    lines: IncomeExpenseEntry[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    const result = await this.headerRepo.createWithTransactions(header, transactions);

    for (const line of lines) {
      await this.ieRepo.create(this.buildEntry(header, line, result.id));
    }

    return result;
  }

  public async update(
    id: string,
    header: Partial<FinancialTransactionHeader>,
    lines: IncomeExpenseEntry[],
  ) {
    const transactions = this.buildTransactions(header, lines);
    const result = await this.headerRepo.updateWithTransactions(id, header, transactions);

    for (const line of lines) {
      await this.ieRepo.create(this.buildEntry(header, line, id));
    }

    return result;
  }
}

