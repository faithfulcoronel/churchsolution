import { injectable, inject } from 'inversify';
import type { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import type { TransactionType } from '../models/financialTransaction.model';
import type { IFinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';
import type { IIncomeExpenseTransactionRepository } from '../repositories/incomeExpenseTransaction.repository';
import type { IIncomeExpenseTransactionMappingRepository } from '../repositories/incomeExpenseTransactionMapping.repository';
import type { IFinancialTransactionRepository } from '../repositories/financialTransaction.repository';
import { TYPES } from '../lib/types';

export interface IncomeExpenseEntry {
  id?: string;
  transaction_type: TransactionType;
  accounts_account_id: string | null;
  fund_id: string | null;
  category_id: string | null;
  source_id: string | null;
  description?: string;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
  batch_id?: string | null;
  member_id?: string | null;
  line?: number | null;
  isDirty?: boolean;
  isDeleted?: boolean;
}

@injectable()
export class IncomeExpenseTransactionService {
  constructor(
    @inject(TYPES.IFinancialTransactionHeaderRepository)
    private headerRepo: IFinancialTransactionHeaderRepository,
    @inject(TYPES.IIncomeExpenseTransactionRepository)
    private ieRepo: IIncomeExpenseTransactionRepository,
    @inject(TYPES.IIncomeExpenseTransactionMappingRepository)
    private mappingRepo: IIncomeExpenseTransactionMappingRepository,
    @inject(TYPES.IFinancialTransactionRepository)
    private ftRepo: IFinancialTransactionRepository,
  ) {}

  private buildTransactions(
    header: Partial<FinancialTransactionHeader>,
    line: IncomeExpenseEntry,
    headerId: string,
  ) {
    const detailDescription =
      line.description && line.description.trim()
        ? line.description.trim()
        : undefined;

    const base = {
      type: line.transaction_type,
      accounts_account_id: line.accounts_account_id,
      fund_id: line.fund_id,
      source_id: line.source_id,
      category_id: line.category_id,
      date: header.transaction_date!,
      description: detailDescription ?? header.description ?? '',
      batch_id: line.batch_id ?? null,
      header_id: headerId,
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
  }

  private buildEntry(
    header: Partial<FinancialTransactionHeader>,
    line: IncomeExpenseEntry,
    headerId: string,
  ) {
    const detailDescription =
      line.description && line.description.trim()
        ? line.description.trim()
        : undefined;

    return {
      transaction_type: line.transaction_type,
      transaction_date: header.transaction_date!,
      amount: line.amount,
      description: detailDescription ?? header.description ?? '',
      reference: (header as any).reference ?? null,
      member_id: line.member_id ?? null,
      category_id: line.category_id,
      fund_id: line.fund_id,
      source_id: line.source_id,
      account_id: line.accounts_account_id,
      header_id: headerId,
      line: line.line ?? undefined,
    };
  }

  public async create(
    header: Partial<FinancialTransactionHeader>,
    lines: IncomeExpenseEntry[],
    onProgress?: (percent: number) => void,
  ) {
    const headerRecord = await this.headerRepo.create(header);

    const total = lines.length;
    for (const [index, line] of lines.entries()) {
      const [debitData, creditData] = this.buildTransactions(
        header,
        line,
        headerRecord.id,
      );

      const debitTx = await this.ftRepo.create(debitData);
      const creditTx = await this.ftRepo.create(creditData);

      const ie = await this.ieRepo.create(
        this.buildEntry(header, line, headerRecord.id),
      );

      await this.mappingRepo.create({
        transaction_id: ie.id,
        transaction_header_id: headerRecord.id,
        debit_transaction_id: debitTx.id,
        credit_transaction_id: creditTx.id,
      });

      onProgress?.(Math.round(((index + 1) / total) * 100));
    }

    return headerRecord;
  }

  public async update(
    transactionId: string,
    header: Partial<FinancialTransactionHeader>,
    line: IncomeExpenseEntry,
  ) {
    const mapping = (await this.mappingRepo.getByTransactionId(transactionId))[0];

    await this.headerRepo.update(mapping.transaction_header_id, header);

    if (line.isDeleted) {
      if (mapping.debit_transaction_id) {
        await this.ftRepo.delete(mapping.debit_transaction_id);
      }
      if (mapping.credit_transaction_id) {
        await this.ftRepo.delete(mapping.credit_transaction_id);
      }
      await this.ieRepo.delete(transactionId);
      await this.mappingRepo.delete(mapping.id);
      return { id: mapping.transaction_header_id } as any;
    }

    const [debitData, creditData] = this.buildTransactions(
      header,
      line,
      mapping.transaction_header_id,
    );

    if (line.isDirty) {
      if (mapping.debit_transaction_id) {
        await this.ftRepo.update(mapping.debit_transaction_id, debitData);
      }
      if (mapping.credit_transaction_id) {
        await this.ftRepo.update(mapping.credit_transaction_id, creditData);
      }

      await this.ieRepo.update(
        transactionId,
        this.buildEntry(header, line, mapping.transaction_header_id),
      );
    }

    return { id: mapping.transaction_header_id } as any;
  }

  public async updateBatch(
    headerId: string,
    header: Partial<FinancialTransactionHeader>,
    lines: IncomeExpenseEntry[],
    onProgress?: (percent: number) => void,
  ) {
    const mappings = await this.mappingRepo.getByHeaderId(headerId);

    await this.headerRepo.update(headerId, header);

    const mappingByTxId = new Map(
      mappings.map(m => [m.transaction_id, m]),
    );
    for (const m of mappings) {
      const line = lines.find(l => l.id === m.transaction_id);
      if (!line || line.isDeleted) {
        if (m.debit_transaction_id) {
          await this.ftRepo.delete(m.debit_transaction_id);
        }
        if (m.credit_transaction_id) {
          await this.ftRepo.delete(m.credit_transaction_id);
        }
        await this.ieRepo.delete(m.transaction_id);
        await this.mappingRepo.delete(m.id);
      }
    }

    const total = lines.length;
    let processed = 0;

    for (const line of lines) {
      if (line.isDeleted) {
        processed++;
        onProgress?.(Math.round((processed / total) * 100));
        continue;
      }
      const existing = line.id ? mappingByTxId.get(line.id) : undefined;
      const [debitData, creditData] = this.buildTransactions(
        header,
        line,
        headerId,
      );

      if (existing) {
        if (line.isDirty) {
          if (existing.debit_transaction_id) {
            await this.ftRepo.update(existing.debit_transaction_id, debitData);
          }
          if (existing.credit_transaction_id) {
            await this.ftRepo.update(existing.credit_transaction_id, creditData);
          }

          await this.ieRepo.update(
            existing.transaction_id,
            this.buildEntry(header, line, headerId),
          );
        }
      } else {
        const debitTx = await this.ftRepo.create(debitData);
        const creditTx = await this.ftRepo.create(creditData);

        const ie = await this.ieRepo.create(
          this.buildEntry(header, line, headerId),
        );

        await this.mappingRepo.create({
          transaction_id: ie.id,
          transaction_header_id: headerId,
          debit_transaction_id: debitTx.id,
          credit_transaction_id: creditTx.id,
        });
      }

      processed++;
      onProgress?.(Math.round((processed / total) * 100));
    }

    return { id: headerId } as any;
  }

  public async delete(transactionId: string) {
    const mapping = (await this.mappingRepo.getByTransactionId(transactionId))[0];

    if (mapping.debit_transaction_id) {
      await this.ftRepo.delete(mapping.debit_transaction_id);
    }
    if (mapping.credit_transaction_id) {
      await this.ftRepo.delete(mapping.credit_transaction_id);
    }

    await this.headerRepo.delete(mapping.transaction_header_id);
    await this.ieRepo.delete(transactionId);
    await this.mappingRepo.delete(mapping.id);
  }

  public async deleteBatch(headerId: string) {
    const mappings = await this.mappingRepo.getByHeaderId(headerId);

    for (const m of mappings) {
      if (m.debit_transaction_id) {
        await this.ftRepo.delete(m.debit_transaction_id);
      }
      if (m.credit_transaction_id) {
        await this.ftRepo.delete(m.credit_transaction_id);
      }
      await this.ieRepo.delete(m.transaction_id);
      await this.mappingRepo.delete(m.id);
    }

    await this.headerRepo.delete(headerId);
  }
}

