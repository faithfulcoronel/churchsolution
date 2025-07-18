import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialSourceService } from '../src/services/FinancialSourceService';
import type { IFinancialSourceRepository } from '../src/repositories/financialSource.repository';

const repo: IFinancialSourceRepository = {
  find: vi.fn().mockResolvedValue({ data: [] }),
  findAll: vi.fn().mockResolvedValue({ data: [] }),
  findById: vi.fn().mockResolvedValue({ data: null }),
  create: vi.fn().mockResolvedValue({ id: '1' }),
  update: vi.fn().mockResolvedValue({ id: '1' }),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IFinancialSourceRepository;

const service = new FinancialSourceService(repo);

describe('FinancialSourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates find to repository', async () => {
    await service.find();
    expect(repo.find).toHaveBeenCalled();
  });

  it('delegates findAll to repository', async () => {
    await service.findAll();
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('delegates findById to repository', async () => {
    await service.findById('1');
    expect(repo.findById).toHaveBeenCalledWith('1', {});
  });

  it('delegates create to repository', async () => {
    await service.create({ name: 'test' });
    expect(repo.create).toHaveBeenCalledWith({ name: 'test' }, undefined, []);
  });

  it('delegates update to repository', async () => {
    await service.update('1', { name: 'x' });
    expect(repo.update).toHaveBeenCalledWith('1', { name: 'x' }, undefined, []);
  });

  it('delegates delete to repository', async () => {
    await service.delete('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
