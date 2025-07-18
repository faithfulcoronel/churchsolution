import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceDashboardService } from '../src/services/FinanceDashboardService';
import type { IFinanceDashboardRepository } from '../src/repositories/financeDashboard.repository';

const repo: IFinanceDashboardRepository = {
  getMonthlyTrends: vi.fn().mockResolvedValue([]),
  getMonthlyStats: vi.fn().mockResolvedValue(null),
  getFundBalances: vi.fn().mockResolvedValue([]),
  getSourceBalances: vi.fn().mockResolvedValue([]),
} as unknown as IFinanceDashboardRepository;

const service = new FinanceDashboardService(repo);

describe('FinanceDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates getMonthlyTrends to repository', async () => {
    await service.getMonthlyTrends();
    expect(repo.getMonthlyTrends).toHaveBeenCalled();
  });

  it('delegates getMonthlyStats to repository', async () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    await service.getMonthlyStats(start, end);
    expect(repo.getMonthlyStats).toHaveBeenCalledWith(start, end);
  });

  it('delegates getFundBalances to repository', async () => {
    await service.getFundBalances();
    expect(repo.getFundBalances).toHaveBeenCalled();
  });

  it('delegates getSourceBalances to repository', async () => {
    await service.getSourceBalances();
    expect(repo.getSourceBalances).toHaveBeenCalled();
  });
});
