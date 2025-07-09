import { describe, it, expect, vi } from 'vitest';
import { FiscalPeriodRepository } from '../src/repositories/fiscalPeriod.repository';
import type { IFiscalPeriodAdapter } from '../src/adapters/fiscalPeriod.adapter';

const adapter: IFiscalPeriodAdapter = {
  fetch: vi.fn().mockResolvedValue({ data: [], count: 0 }),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as IFiscalPeriodAdapter;

describe('FiscalPeriodRepository', () => {
  it('delegates find to adapter', async () => {
    const repo = new FiscalPeriodRepository(adapter);
    const options = { filters: { name: { operator: 'eq', value: 'Q1' } } } as any;
    await repo.find(options);
    expect(adapter.fetch).toHaveBeenCalledWith(options);
  });
});
