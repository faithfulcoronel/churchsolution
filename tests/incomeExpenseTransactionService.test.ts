import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IncomeExpenseTransactionService, IncomeExpenseEntry } from '../src/services/IncomeExpenseTransactionService';
import type { IFinancialTransactionHeaderRepository } from '../src/repositories/financialTransactionHeader.repository';
import type { IIncomeExpenseTransactionRepository } from '../src/repositories/incomeExpenseTransaction.repository';
import type { IIncomeExpenseTransactionMappingRepository } from '../src/repositories/incomeExpenseTransactionMapping.repository';
import type { IFinancialTransactionRepository } from '../src/repositories/financialTransaction.repository';

const headerRepo = {
  create: vi.fn().mockResolvedValue({ id: 'h1' }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IFinancialTransactionHeaderRepository;

const ieRepo = {
  create: vi.fn().mockResolvedValue({ id: 't1' }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IIncomeExpenseTransactionRepository;

const mappingRepo = {
  create: vi.fn().mockResolvedValue({}),
  getByTransactionId: vi.fn().mockResolvedValue([
    {
      id: 'm1',
      transaction_header_id: 'h1',
      debit_transaction_id: 'd1',
      credit_transaction_id: 'c1',
    },
  ]),
  getByHeaderId: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IIncomeExpenseTransactionMappingRepository;

const ftRepo = {
  create: vi.fn()
    .mockResolvedValueOnce({ id: 'd1' })
    .mockResolvedValueOnce({ id: 'c1' })
    .mockResolvedValue({ id: 'x' }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IFinancialTransactionRepository;

const service = new IncomeExpenseTransactionService(
  headerRepo,
  ieRepo,
  mappingRepo,
  ftRepo,
);

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

    expect(headerRepo.create).toHaveBeenCalledTimes(1);
    expect(ftRepo.create).toHaveBeenCalledTimes(2);
    const [firstTx, secondTx] = ftRepo.create.mock.calls;
    expect(firstTx[0]).toEqual(
      expect.objectContaining({ account_id: 'sa1', debit: 10 })
    );
    expect(secondTx[0]).toEqual(
      expect.objectContaining({ account_id: 'ca1', credit: 10 })
    );
    expect(ieRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ header_id: 'h1' })
    );
    expect(mappingRepo.create).toHaveBeenCalledWith({
      transaction_id: 't1',
      transaction_header_id: 'h1',
      debit_transaction_id: 'd1',
      credit_transaction_id: 'c1',
    });
  });

  it('uses header description for blank entry descriptions', async () => {
    const entry: IncomeExpenseEntry = {
      ...baseEntry,
      transaction_type: 'income',
      description: '  '
    };
    await service.create(header, [entry]);

    expect(ieRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: header.description })
    );
  });

  it('creates expense transactions and records on update', async () => {
    const entry: IncomeExpenseEntry = {
      ...baseEntry,
      transaction_type: 'expense',
      isDirty: true,
    };
    await service.update('t1', header, entry);

    expect(mappingRepo.getByTransactionId).toHaveBeenCalledWith('t1');
    expect(headerRepo.update).toHaveBeenCalledWith('h1', header);
    expect(ftRepo.update).toHaveBeenCalledTimes(2);
    const [dCall, cCall] = ftRepo.update.mock.calls;
    expect(dCall[0]).toBe('d1');
    expect(cCall[0]).toBe('c1');
    expect(ieRepo.update).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ header_id: 'h1' })
    );
  });

  it('deletes transaction when update called with isDeleted', async () => {
    const entry: IncomeExpenseEntry = {
      ...baseEntry,
      transaction_type: 'expense',
      isDeleted: true,
    };
    await service.update('t1', header, entry);

    expect(mappingRepo.getByTransactionId).toHaveBeenCalledWith('t1');
    expect(headerRepo.update).toHaveBeenCalledWith('h1', header);
    expect(ftRepo.delete).toHaveBeenCalledWith('d1');
    expect(ftRepo.delete).toHaveBeenCalledWith('c1');
    expect(ieRepo.delete).toHaveBeenCalledWith('t1');
    expect(mappingRepo.delete).toHaveBeenCalledWith('m1');
  });


  it('maps multiple entries to balanced transactions', async () => {
    const entries: IncomeExpenseEntry[] = [
      { ...baseEntry, transaction_type: 'income' },
      {
        accounts_account_id: 'acc2',
        fund_id: 'f2',
        category_id: 'c2',
        source_id: 's2',
        amount: 20,
        source_account_id: 'sa2',
        category_account_id: 'ca2',
        transaction_type: 'expense'
      }
    ];
    await service.create(header, entries);

    expect(headerRepo.create).toHaveBeenCalledTimes(1);
    expect(ftRepo.create).toHaveBeenCalledTimes(4);
    const txCalls = ftRepo.create.mock.calls;
    expect(txCalls[0][0]).toEqual(
      expect.objectContaining({ account_id: 'sa1', debit: 10 })
    );
    expect(txCalls[1][0]).toEqual(
      expect.objectContaining({ account_id: 'ca1', credit: 10 })
    );
    expect(txCalls[2][0]).toEqual(
      expect.objectContaining({ account_id: 'ca2', debit: 20 })
    );
    expect(txCalls[3][0]).toEqual(
      expect.objectContaining({ account_id: 'sa2', credit: 20 })
    );
    const totals = txCalls.reduce(
      (tot, [t]) => {
        tot.debit += t.debit;
        tot.credit += t.credit;
        return tot;
      },
      { debit: 0, credit: 0 }
    );
    const totalDebit = totals.debit;
    const totalCredit = totals.credit;
    expect(totalDebit).toBe(totalCredit);
  });

  it('deletes entries with mapping', async () => {
    await service.delete('t1');

    expect(mappingRepo.getByTransactionId).toHaveBeenCalledWith('t1');
    expect(ftRepo.delete).toHaveBeenCalledWith('d1');
    expect(ftRepo.delete).toHaveBeenCalledWith('c1');
    expect(headerRepo.delete).toHaveBeenCalledWith('h1');
    expect(ieRepo.delete).toHaveBeenCalledWith('t1');
    expect(mappingRepo.delete).toHaveBeenCalledWith('m1');
  });

  it('deletes batches with all related records', async () => {
    mappingRepo.getByHeaderId.mockResolvedValue([
      {
        id: 'm1',
        transaction_id: 't1',
        transaction_header_id: 'h1',
        debit_transaction_id: 'd1',
        credit_transaction_id: 'c1',
      },
      {
        id: 'm2',
        transaction_id: 't2',
        transaction_header_id: 'h1',
        debit_transaction_id: 'd2',
        credit_transaction_id: 'c2',
      },
    ]);

    await service.deleteBatch('h1');

    expect(mappingRepo.getByHeaderId).toHaveBeenCalledWith('h1');
    expect(ftRepo.delete).toHaveBeenCalledWith('d1');
    expect(ftRepo.delete).toHaveBeenCalledWith('c1');
    expect(ftRepo.delete).toHaveBeenCalledWith('d2');
    expect(ftRepo.delete).toHaveBeenCalledWith('c2');
    expect(ieRepo.delete).toHaveBeenCalledWith('t1');
    expect(ieRepo.delete).toHaveBeenCalledWith('t2');
    expect(mappingRepo.delete).toHaveBeenCalledWith('m1');
    expect(mappingRepo.delete).toHaveBeenCalledWith('m2');
    expect(headerRepo.delete).toHaveBeenCalledWith('h1');
  });

  it('updates batches by updating existing lines and creating new ones', async () => {
    mappingRepo.getByHeaderId.mockResolvedValue([
      {
        id: 'm1',
        transaction_id: 't1',
        transaction_header_id: 'h1',
        debit_transaction_id: 'd1',
        credit_transaction_id: 'c1',
      },
      {
        id: 'm2',
        transaction_id: 't2',
        transaction_header_id: 'h1',
        debit_transaction_id: 'd2',
        credit_transaction_id: 'c2',
      }
    ]);

    const entries: IncomeExpenseEntry[] = [
      {
        id: 't1',
        ...baseEntry,
        amount: 15,
        transaction_type: 'income',
        isDirty: true,
      },
      {
        id: 't2',
        ...baseEntry,
        transaction_type: 'income',
        isDeleted: true,
      },
      { ...baseEntry, transaction_type: 'expense' }
    ];

    await service.updateBatch('h1', header, entries);

    expect(mappingRepo.getByHeaderId).toHaveBeenCalledWith('h1');

    // removed line t2 should be deleted
    expect(ftRepo.delete).toHaveBeenCalledWith('d2');
    expect(ftRepo.delete).toHaveBeenCalledWith('c2');
    expect(ieRepo.delete).toHaveBeenCalledWith('t2');
    expect(mappingRepo.delete).toHaveBeenCalledWith('m2');

    // existing line t1 should be updated
    expect(ftRepo.update).toHaveBeenCalledWith('d1', expect.any(Object));
    expect(ftRepo.update).toHaveBeenCalledWith('c1', expect.any(Object));
    expect(ieRepo.update).toHaveBeenCalledWith('t1', expect.any(Object));

    // new line should create new records
    expect(ftRepo.create).toHaveBeenCalledTimes(2);
    expect(mappingRepo.create).toHaveBeenCalledTimes(1);
  });
});
