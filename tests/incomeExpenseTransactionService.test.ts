import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncomeExpenseTransactionService, IncomeExpenseEntry } from '../src/services/IncomeExpenseTransactionService';
import type { IFinancialTransactionHeaderRepository } from '../src/repositories/financialTransactionHeader.repository';
import type { IIncomeExpenseTransactionRepository } from '../src/repositories/incomeExpenseTransaction.repository';

const headerRepo = {
  createWithTransactions: vi.fn().mockResolvedValue({ id: 'h1' }),
  updateWithTransactions: vi.fn().mockResolvedValue({ id: 'h1' }),
} as unknown as IFinancialTransactionHeaderRepository;

const ieRepo = {
  create: vi.fn().mockResolvedValue(null),
} as unknown as IIncomeExpenseTransactionRepository;

const service = new IncomeExpenseTransactionService(headerRepo, ieRepo);

const header = { transaction_date: '2025-06-01', description: 'Test' };
const baseEntry = {
  accounts_account_id: 'acc1',
  fund_id: 'f1',
  category_id: 'c1',
  source_id: 's1',
  amount: 10,
  source_account_id: 'sa1',
  category_account_id: 'ca1',
} as Omit<IncomeExpenseEntry, 'transaction_type'>;

describe('IncomeExpenseTransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates income transactions and records', async () => {
    const entry: IncomeExpenseEntry = { ...baseEntry, transaction_type: 'income' };
    await service.create(header, [entry]);

    expect(headerRepo.createWithTransactions).toHaveBeenCalledTimes(1);
    const [, tx] = (headerRepo.createWithTransactions as any).mock.calls[0];
    expect(tx).toEqual([
      {
        accounts_account_id: 'acc1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-01',
        description: 'Test',
        batch_id: null,
        account_id: 'sa1',
        debit: 10,
        credit: 0,
      },
      {
        accounts_account_id: 'acc1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-01',
        description: 'Test',
        batch_id: null,
        account_id: 'ca1',
        debit: 0,
        credit: 10,
      },
    ]);
    expect(ieRepo.create).toHaveBeenCalledWith({
      transaction_type: 'income',
      transaction_date: '2025-06-01',
      amount: 10,
      description: 'Test',
      reference: null,
      member_id: null,
      category_id: 'c1',
      fund_id: 'f1',
      source_id: 's1',
      account_id: 'acc1',
    });
  });

  it('creates expense transactions and records on update', async () => {
    const entry: IncomeExpenseEntry = { ...baseEntry, transaction_type: 'expense' };
    await service.update('h1', header, [entry]);

    expect(headerRepo.updateWithTransactions).toHaveBeenCalledTimes(1);
    const [, , tx] = (headerRepo.updateWithTransactions as any).mock.calls[0];
    expect(tx[0].debit).toBe(10);
    expect(tx[1].credit).toBe(10);
    expect(ieRepo.create).toHaveBeenCalled();
  });
});

