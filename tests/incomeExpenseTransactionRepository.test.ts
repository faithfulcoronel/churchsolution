import { describe, it, expect, vi } from 'vitest';
import { IncomeExpenseTransactionRepository } from '../src/repositories/incomeExpenseTransaction.repository';
import type { IIncomeExpenseTransactionAdapter } from '../src/adapters/incomeExpenseTransaction.adapter';

const adapter: IIncomeExpenseTransactionAdapter & { getByHeaderId: any } = {
  fetch: vi.fn(),
  fetchAll: vi.fn(),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getByHeaderId: vi.fn().mockResolvedValue([])
} as any;

describe('IncomeExpenseTransactionRepository', () => {
  it('delegates getByHeaderId to adapter', async () => {
    const repo = new IncomeExpenseTransactionRepository(adapter);
    await repo.getByHeaderId('h1');
    expect(adapter.getByHeaderId).toHaveBeenCalledWith('h1');
  });
});
