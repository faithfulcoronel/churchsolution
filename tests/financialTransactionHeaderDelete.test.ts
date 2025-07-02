import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialTransactionHeaderAdapter } from '../src/adapters/financialTransactionHeader.adapter';
import type { AuditService } from '../src/services/AuditService';

// Mock tenant utils
vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn().mockResolvedValue('t1') }
}));

const headerChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { status: 'draft' }, error: null })
};

const deleteChain = {
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis()
};

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'financial_transaction_headers') {
        return headerChain as any;
      }
      if (table === 'financial_transactions') {
        return deleteChain as any;
      }
      return {} as any;
    })
  }
}));

class TestAdapter extends FinancialTransactionHeaderAdapter {
  constructor() {
    super({} as AuditService);
  }
  public async runBeforeDelete(id: string) {
    // @ts-ignore access protected method
    await this.onBeforeDelete(id);
  }
}

describe('FinancialTransactionHeaderAdapter beforeDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes related transactions for a draft header', async () => {
    const adapter = new TestAdapter();
    await adapter.runBeforeDelete('h1');
    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith('header_id', 'h1');
  });
});
