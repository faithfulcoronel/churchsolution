import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAccountService } from '../src/services/AccountService';
import type { IAccountRepository } from '../src/repositories/account.repository';

const repo: IAccountRepository = {
  findAll: vi.fn().mockResolvedValue({ data: [] }),
  findById: vi.fn().mockResolvedValue({ data: null }),
  create: vi.fn().mockResolvedValue({ id: '1' }),
  update: vi.fn().mockResolvedValue({ id: '1' }),
  delete: vi.fn().mockResolvedValue(undefined),
} as unknown as IAccountRepository;

const service = new SupabaseAccountService(repo);

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates getAll to repository', async () => {
    await service.getAll();
    expect(repo.findAll).toHaveBeenCalled();
  });

  it('delegates getById to repository', async () => {
    await service.getById('1');
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

  it('delegates remove to repository', async () => {
    await service.remove('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
