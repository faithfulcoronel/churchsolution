import { describe, it, expect } from 'vitest';
import { SourceRecentTransactionRepository } from '../src/repositories/sourceRecentTransaction.repository';
import type { ISourceRecentTransactionAdapter } from '../src/adapters/sourceRecentTransaction.adapter';

const adapter: ISourceRecentTransactionAdapter = {
  fetchRecent: async () => [
    {
      header_id: 'h1',
      source_id: 's1',
      account_id: 'a1',
      fund_id: 'f1',
      date: '2025-06-01',
      category: 'Tithe',
      description: 'desc',
      amount: '50'
    }
  ],
  fetchRecentByFund: async () => [
    {
      header_id: 'h1',
      source_id: 's1',
      account_id: 'a1',
      fund_id: 'f1',
      date: '2025-06-01',
      category: 'Tithe',
      description: 'desc',
      amount: '50'
    }
  ],
  fetchBalance: async () => 25,
  fetchBalanceByFund: async () => ['10', '-5', '20']
} as any;

describe('SourceRecentTransactionRepository mapping', () => {
  const repo = new SourceRecentTransactionRepository(adapter);

  it('maps rows correctly', async () => {
    const data = await repo.getRecentTransactions('a1');
    expect(data[0]).toEqual({
      header_id: 'h1',
      source_id: 's1',
      account_id: 'a1',
      fund_id: 'f1',
      date: '2025-06-01',
      category: 'Tithe',
      description: 'desc',
      amount: 50
    });
  });

  it('maps rows by fund correctly', async () => {
    const data = await repo.getRecentTransactionsByFund('f1');
    expect(data[0]).toEqual({
      header_id: 'h1',
      source_id: 's1',
      account_id: 'a1',
      fund_id: 'f1',
      date: '2025-06-01',
      category: 'Tithe',
      description: 'desc',
      amount: 50
    });
  });

  it('calculates balance correctly', async () => {
    const total = await repo.getBalance('a1');
    expect(total).toBe(25);
  });

  it('calculates fund balance correctly', async () => {
    const total = await repo.getBalanceByFund('f1');
    expect(total).toBe(25);
  });
});
