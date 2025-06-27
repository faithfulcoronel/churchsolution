import { describe, it, expect } from 'vitest';
import { FundRepository } from '../src/repositories/fund.repository';
import type { IFundAdapter } from '../src/adapters/fund.adapter';
import type { Fund } from '../src/models/fund.model';

class TestFundRepository extends FundRepository {
  public async runBeforeCreate(data: Partial<Fund>) {
    return this.beforeCreate(data);
  }
  public async runBeforeUpdate(id: string, data: Partial<Fund>) {
    return this.beforeUpdate(id, data);
  }
}

describe('FundRepository validation', () => {
  it('throws error for invalid data on create', async () => {
    const repo = new TestFundRepository({} as IFundAdapter);
    await expect(repo.runBeforeCreate({ name: '' })).rejects.toThrow('Fund name is required');
  });

  it('throws error for invalid fund type', async () => {
    const repo = new TestFundRepository({} as IFundAdapter);
    await expect(
      repo.runBeforeCreate({ name: 'Test', type: 'bad' as any })
    ).rejects.toThrow('Invalid fund type');
  });

  it('formats data on create', async () => {
    const repo = new TestFundRepository({} as IFundAdapter);
    const data = await repo.runBeforeCreate({ code: ' gf ', name: '  My Fund ', description: '  Desc  ', type: 'restricted' });
    expect(data.code).toBe('GF');
    expect(data.name).toBe('My Fund');
    expect(data.description).toBe('Desc');
  });

  it('throws error for invalid fund code', async () => {
    const repo = new TestFundRepository({} as IFundAdapter);
    await expect(repo.runBeforeCreate({ code: '  ', name: 'Test' })).rejects.toThrow('Fund code is required');
    await expect(repo.runBeforeCreate({ code: 'abc', name: 'Test' })).rejects.toThrow('Invalid fund code');
  });

  it('validates on update', async () => {
    const repo = new TestFundRepository({} as IFundAdapter);
    await expect(
      repo.runBeforeUpdate('1', { name: '' })
    ).rejects.toThrow('Fund name is required');
  });
});
