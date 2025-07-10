import { describe, it, expect, vi } from 'vitest';
import { TenantRepository } from '../src/repositories/tenant.repository';
import type { ITenantAdapter } from '../src/adapters/tenant.adapter';

const adapter: ITenantAdapter = {
  fetch: vi.fn().mockResolvedValue({ data: [], count: 0 }),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
} as unknown as ITenantAdapter;

describe('TenantRepository', () => {
  it('delegates find to adapter', async () => {
    const repo = new TenantRepository(adapter);
    const options = { filters: { name: { operator: 'eq', value: 'test' } } } as any;
    await repo.find(options);
    expect(adapter.fetch).toHaveBeenCalledWith(options);
  });
});
