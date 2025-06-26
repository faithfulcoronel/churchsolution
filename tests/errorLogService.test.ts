import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseErrorLogService } from '../src/services/ErrorLogService';
import type { IErrorLogRepository } from '../src/repositories/errorLog.repository';

const repo: IErrorLogRepository = {
  create: vi.fn().mockResolvedValue({}),
} as unknown as IErrorLogRepository;

const service = new SupabaseErrorLogService(repo);

describe('ErrorLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs errors via repository', async () => {
    await service.logError('oops', 'stack', { a: 1 });
    expect(repo.create).toHaveBeenCalledWith({ message: 'oops', stack: 'stack', context: { a: 1 } });
  });
});
