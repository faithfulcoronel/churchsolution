import { describe, it, expect } from 'vitest';
import { calculateAccountBalance, Transaction } from '../src/utils/accounting';

describe('calculateAccountBalance', () => {
  it('returns positive balance for liability when credits exceed debits', () => {
    const txs: Transaction[] = [
      { credit: 200 },
      { debit: 50 }
    ];
    const result = calculateAccountBalance('liability', txs);
    expect(result).toBe(150);
  });

  it('returns negative balance for asset when credits exceed debits', () => {
    const txs: Transaction[] = [
      { debit: 100 },
      { credit: 150 }
    ];
    const result = calculateAccountBalance('asset', txs);
    expect(result).toBe(-50);
  });
});
