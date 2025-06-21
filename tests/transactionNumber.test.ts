import { describe, it, expect, vi } from 'vitest';
import { FinancialTransactionHeaderAdapter } from '../src/adapters/financialTransactionHeader.adapter';
import type { AuditService } from '../src/services/AuditService';

// Mock supabase query chain
const chain = {
  select: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [], error: null })
};

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => chain)
  }
}));

class TestAdapter extends FinancialTransactionHeaderAdapter {
  constructor() {
    super({} as AuditService);
  }
  public async generate(date: string, status: string) {
    return (this as any).generateTransactionNumber(date, status);
  }
}

describe('generateTransactionNumber', () => {
  it('uses status prefixes', async () => {
    const adapter = new TestAdapter();
    const numDraft = await adapter.generate('2025-06-01', 'draft');
    expect(numDraft.startsWith('DFT-')).toBe(true);

    const numSub = await adapter.generate('2025-06-01', 'submitted');
    expect(numSub.startsWith('SUB-')).toBe(true);

    const numApp = await adapter.generate('2025-06-01', 'approved');
    expect(numApp.startsWith('APP-')).toBe(true);
  });
});
