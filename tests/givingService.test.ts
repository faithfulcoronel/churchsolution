import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GivingService, GivingLine } from '../src/services/GivingService';
import type { IFinancialTransactionHeaderRepository } from '../src/repositories/financialTransactionHeader.repository';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

const headerRepo = {
  createWithTransactions: vi.fn().mockResolvedValue({ id: 'h1' })
} as unknown as IFinancialTransactionHeaderRepository;

const service = new GivingService(headerRepo);

const header = { transaction_date: '2025-06-01', description: 'Sunday' };
const lines: GivingLine[] = [
  {
    member_id: 'm1',
    fund_id: 'f1',
    category_id: 'c1',
    source_id: 's1',
    amount: 100,
    source_account_id: 'a1',
    category_account_id: 'a2',
    batch_id: 'b1'
  }
];

describe('GivingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates balanced transactions and refreshes batch totals', async () => {
    const { supabase } = await import('../src/lib/supabase');
    await service.createGivingBatch(header, lines);

    expect(headerRepo.createWithTransactions).toHaveBeenCalledTimes(1);
    const [passedHeader, tx] =
      (headerRepo.createWithTransactions as any).mock.calls[0];
    expect(passedHeader).toBe(header);
    expect(tx).toEqual([
      {
        member_id: 'm1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-01',
        description: 'Sunday',
        batch_id: 'b1',
        account_id: 'a1',
        debit: 100,
        credit: 0
      },
      {
        member_id: 'm1',
        fund_id: 'f1',
        source_id: 's1',
        category_id: 'c1',
        date: '2025-06-01',
        description: 'Sunday',
        batch_id: 'b1',
        account_id: 'a2',
        debit: 0,
        credit: 100
      }
    ]);
    const totalDebit = tx.reduce((s: number, t: any) => s + t.debit, 0);
    const totalCredit = tx.reduce((s: number, t: any) => s + t.credit, 0);
    expect(totalDebit).toBe(totalCredit);
    expect(supabase.rpc).toHaveBeenCalledWith('refresh_offering_batch_total', { p_batch_id: 'b1' });
  });
});
