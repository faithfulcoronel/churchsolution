import { describe, it, expect } from 'vitest';
import { IncomeExpenseTransactionRepository } from '../src/repositories/incomeExpenseTransaction.repository';
import type { IIncomeExpenseTransactionAdapter } from '../src/adapters/incomeExpenseTransaction.adapter';
import type { IncomeExpenseTransaction } from '../src/models/incomeExpenseTransaction.model';

class TestRepo extends IncomeExpenseTransactionRepository {
  public async runBeforeCreate(data: Partial<IncomeExpenseTransaction>) {
    // @ts-ignore access protected
    return this.beforeCreate(data);
  }
  public async runBeforeUpdate(id: string, data: Partial<IncomeExpenseTransaction>) {
    // @ts-ignore access protected
    return this.beforeUpdate(id, data);
  }
}

describe('IncomeExpenseTransactionRepository validation', () => {
  it('throws error for missing transaction date', async () => {
    const repo = new TestRepo({} as IIncomeExpenseTransactionAdapter);
    await expect(
      repo.runBeforeCreate({ transaction_date: '', description: 't', amount: 1 })
    ).rejects.toThrow('Transaction date is required');
  });

  it('throws error for invalid amount', async () => {
    const repo = new TestRepo({} as IIncomeExpenseTransactionAdapter);
    await expect(
      repo.runBeforeCreate({ transaction_date: '2024-01-01', description: 't', amount: 'abc' as any })
    ).rejects.toThrow('Amount must be a valid number');
  });

  it('throws error for invalid line', async () => {
    const repo = new TestRepo({} as IIncomeExpenseTransactionAdapter);
    await expect(
      repo.runBeforeCreate({
        transaction_date: '2024-01-01',
        description: 't',
        amount: 1,
        line: 'abc' as any,
      })
    ).rejects.toThrow('Line must be a valid number');
  });

  it('formats data on create', async () => {
    const repo = new TestRepo({} as IIncomeExpenseTransactionAdapter);
    const data = await repo.runBeforeCreate({
      transaction_date: '2025-06-01',
      description: '  Hello  ',
      reference: '  Ref  ',
      amount: 5,
    });
    expect(data.description).toBe('Hello');
    expect(data.reference).toBe('Ref');
  });

  it('allows blank descriptions on update', async () => {
    const repo = new TestRepo({} as IIncomeExpenseTransactionAdapter);
    await expect(
      repo.runBeforeUpdate('1', { description: ' ', transaction_date: '2025-06-01', amount: 10 })
    ).resolves.toEqual({
      transaction_date: '2025-06-01',
      description: '',
      amount: 10
    });
  });
});
