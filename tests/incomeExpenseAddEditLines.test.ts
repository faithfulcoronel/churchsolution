import { describe, it, expect } from 'vitest';

interface Entry {
  line?: number;
  isDeleted?: boolean;
}

function getVisibleEntries(entries: Entry[]) {
  return entries
    .filter(e => !e.isDeleted)
    .sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}

describe('IncomeExpenseAddEdit line numbers', () => {
  it('returns sequential numbers after delete and add', () => {
    const entries: Entry[] = [
      { line: 1 },
      { line: 2 },
      { line: 3 }
    ];

    // delete first entry
    entries[0].isDeleted = true;
    let visible = getVisibleEntries(entries);
    const afterDelete = visible.map((_, idx) => idx + 1);
    expect(afterDelete).toEqual([1, 2]);

    // add new entry
    entries.push({ line: entries.filter(e => !e.isDeleted).length + 1 });
    visible = getVisibleEntries(entries);
    const afterAdd = visible.map((_, idx) => idx + 1);
    expect(afterAdd).toEqual([1, 2, 3]);
  });
});
