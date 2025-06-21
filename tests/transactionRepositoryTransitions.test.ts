import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialTransactionHeaderRepository } from '../src/repositories/financialTransactionHeader.repository';
import type { IFinancialTransactionHeaderAdapter } from '../src/adapters/financialTransactionHeader.adapter';
import { NotificationService } from '../src/services/NotificationService';

const id = 'abc123';

describe('FinancialTransactionHeaderRepository transitions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('posts a transaction and notifies success', async () => {
    const adapter = {
      postTransaction: vi.fn().mockResolvedValue(undefined)
    } as unknown as IFinancialTransactionHeaderAdapter;

    const repo = new FinancialTransactionHeaderRepository(adapter);
    const successSpy = vi.spyOn(NotificationService, 'showSuccess').mockImplementation(() => {});

    await repo.postTransaction(id);

    expect(adapter.postTransaction).toHaveBeenCalledWith(id);
    expect(successSpy).toHaveBeenCalledWith('Transaction posted successfully');
  });

  it('submits a transaction and notifies success', async () => {
    const adapter = {
      submitTransaction: vi.fn().mockResolvedValue(undefined)
    } as unknown as IFinancialTransactionHeaderAdapter;

    const repo = new FinancialTransactionHeaderRepository(adapter);
    const successSpy = vi.spyOn(NotificationService, 'showSuccess').mockImplementation(() => {});

    await repo.submitTransaction(id);

    expect(adapter.submitTransaction).toHaveBeenCalledWith(id);
    expect(successSpy).toHaveBeenCalledWith('Transaction submitted successfully');
  });

  it('approves a transaction and notifies success', async () => {
    const adapter = {
      approveTransaction: vi.fn().mockResolvedValue(undefined)
    } as unknown as IFinancialTransactionHeaderAdapter;

    const repo = new FinancialTransactionHeaderRepository(adapter);
    const successSpy = vi.spyOn(NotificationService, 'showSuccess').mockImplementation(() => {});

    await repo.approveTransaction(id);

    expect(adapter.approveTransaction).toHaveBeenCalledWith(id);
    expect(successSpy).toHaveBeenCalledWith('Transaction approved successfully');
  });

  it('handles errors on invalid approve transition', async () => {
    const error = new Error('Invalid transition');
    const adapter = {
      approveTransaction: vi.fn().mockRejectedValue(error)
    } as unknown as IFinancialTransactionHeaderAdapter;

    const repo = new FinancialTransactionHeaderRepository(adapter);
    const errorSpy = vi.spyOn(NotificationService, 'showError').mockImplementation(() => {});

    await expect(repo.approveTransaction(id)).rejects.toThrow(error);
    expect(adapter.approveTransaction).toHaveBeenCalledWith(id);
    expect(errorSpy).toHaveBeenCalledWith('Invalid transition', 5000);
  });
});
