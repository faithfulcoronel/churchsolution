import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseService, ExpenseLine } from '../src/services/ExpenseService';
import type { IFinancialTransactionHeaderRepository } from '../src/repositories/financialTransactionHeader.repository';

const headerRepo = {
  createWithTransactions: vi.fn().mockResolvedValue({ id: 'h1' })
} as unknown as IFinancialTransactionHeaderRepository;

const service = new ExpenseService(headerRepo);

const header = { transaction_date: '2025-06-02', description: 'Supplies' };
const lines: ExpenseLine[] = [
  {
    accounts_account_id: 'acc1',
    fund_id: 'f1',
    category_id: 'c1',
    source_id: 's1',
    amount: 50,
    source_account_id: 'a1',
    category_account_id: 'a2'
  }
];

describe('ExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates balanced transactions', async () => {
    await service.createExpenseBatch(header, lines);

    expect(headerRepo.createWithTransactions).toHaveBeenCalledTimes(1);
    const [passedHeader, tx] = (headerRepo.createWithTransactions as any).mock.calls[0];
    expect(passedHeader).toBe(header);
    expect(tx).toEqual([
      {
        accounts_account_id: 'acc1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-02',
        description: 'Supplies',
        account_id: 'a2',
        debit: 50,
        credit: 0,
      },
      {
        accounts_account_id: 'acc1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-02',
        description: 'Supplies',
        account_id: 'a1',
        debit: 0,
        credit: 50,
      }
    ]);
    const totalDebit = tx.reduce((s: number, t: any) => s + t.debit, 0);
    const totalCredit = tx.reduce((s: number, t: any) => s + t.credit, 0);
    expect(totalDebit).toBe(totalCredit);
  });
});
