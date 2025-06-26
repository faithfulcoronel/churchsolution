export interface Transaction {
  debit?: number | null;
  credit?: number | null;
}

/**
 * Calculate balance for an account based on its type.
 * Assets and expenses increase with debits while liabilities and equity
 * increase with credits.
 */
export function calculateAccountBalance(
  accountType: string,
  transactions: Transaction[]
): number {
  return transactions.reduce((sum, tx) => {
    const debit = tx.debit ?? 0;
    const credit = tx.credit ?? 0;
    if (accountType === 'asset' || accountType === 'expense') {
      return sum + debit - credit;
    }
    if (accountType === 'liability' || accountType === 'equity') {
      return sum + credit - debit;
    }
    // default behaviour mirrors assets
    return sum + debit - credit;
  }, 0);
}

/**
 * Check if a set of transactions is balanced (total debits equal credits).
 */
export function isTransactionsBalanced(transactions: Transaction[]): boolean {
  const totals = transactions.reduce(
    (sum, tx) => {
      sum.debit += tx.debit ?? 0;
      sum.credit += tx.credit ?? 0;
      return sum;
    },
    { debit: 0, credit: 0 }
  );
  return Math.abs(totals.debit - totals.credit) < 0.01;
}
