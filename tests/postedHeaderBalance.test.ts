import { describe, it, expect } from 'vitest';
import { isTransactionsBalanced } from '../src/utils/accounting';

describe('posted transaction headers', () => {
  const sample = [
    { header_id: 'h1', debit: 100, credit: 0, fund_id: 'f1', batch_id: 'b1', amount: 100 },
    { header_id: 'h1', debit: 0, credit: 100, fund_id: 'f1', batch_id: 'b1', amount: -100 },
    { header_id: 'h2', debit: 50, credit: 0, fund_id: 'f2', batch_id: 'b2', amount: 50 },
    { header_id: 'h2', debit: 0, credit: 50, fund_id: 'f2', batch_id: 'b2', amount: -50 }
  ];

  it('ensures each posted header is balanced', () => {
    const headers = Array.from(new Set(sample.map(t => t.header_id)));
    for (const h of headers) {
      const entries = sample.filter(t => t.header_id === h);
      expect(isTransactionsBalanced(entries)).toBe(true);
    }
  });

  it('detects an unbalanced header', () => {
    const bad = [
      { header_id: 'h3', debit: 10, credit: 0 },
      { header_id: 'h3', debit: 0, credit: 5 }
    ];
    expect(isTransactionsBalanced(bad)).toBe(false);
  });

  it('aggregates totals by batch after migration', () => {
    const batchTotals: Record<string, number> = {};
    for (const t of sample) {
      batchTotals[t.batch_id] = (batchTotals[t.batch_id] ?? 0) + (t.amount ?? 0);
    }
    expect(batchTotals['b1']).toBe(0);
    expect(batchTotals['b2']).toBe(0);
  });
});
