import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberService } from '../src/services/MemberService';
import type { IMemberRepository } from '../src/repositories/member.repository';
import type { IAccountRepository } from '../src/repositories/account.repository';
import type { IFinancialTransactionRepository } from '../src/repositories/financialTransaction.repository';

const memberRepo = {} as IMemberRepository;

const accountRepo: IAccountRepository = {
  findAll: vi.fn().mockResolvedValue({ data: [{ id: 'acc1' }] }),
} as unknown as IAccountRepository;

const ftRepo: IFinancialTransactionRepository = {
  findAll: vi.fn().mockResolvedValue({ data: [{ credit: 10 }] }),
} as unknown as IFinancialTransactionRepository;

const service = new MemberService(memberRepo, accountRepo, ftRepo);

describe('MemberService financial methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches totals using account id', async () => {
    const totals = await service.getFinancialTotals('m1');
    expect(accountRepo.findAll).toHaveBeenCalledWith({
      select: 'id',
      filters: { member_id: { operator: 'eq', value: 'm1' } },
    });
    expect(ftRepo.findAll).toHaveBeenCalledTimes(6);
    expect(totals).toEqual({
      year: 10,
      month: 10,
      week: 10,
      yearChange: 0,
      monthChange: 0,
      weekChange: 0,
    });
  });

  it('returns zeros when account missing', async () => {
    (accountRepo.findAll as any).mockResolvedValueOnce({ data: [] });
    const totals = await service.getFinancialTotals('m2');
    expect(totals).toEqual({
      year: 0,
      month: 0,
      week: 0,
      yearChange: 0,
      monthChange: 0,
      weekChange: 0,
    });
  });

  it('gets recent transactions', async () => {
    await service.getRecentTransactions('m1');
    expect(ftRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { column: 'date', ascending: false },
        pagination: { page: 1, pageSize: 10 },
      }),
    );
  });
});
