import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';

type DateRange = { from: Date; to: Date };

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  dateRange: DateRange;
}

interface StoreState {
  income: FilterState;
  expense: FilterState;
  setFilter: (type: TransactionType, filter: Partial<FilterState>) => void;
  resetFilter: (type: TransactionType) => void;
}

const defaultDateRange = (): DateRange => ({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
});

const defaultFilterState = (): FilterState => ({
  searchTerm: '',
  statusFilter: 'all',
  dateRange: defaultDateRange(),
});

export const useIncomeExpenseFilterStore = create<StoreState>()(
  persist(
    (set, get) => ({
      income: defaultFilterState(),
      expense: defaultFilterState(),
      setFilter: (type, filter) => {
        const current = get()[type];
        set({ [type]: { ...current, ...filter } });
      },
      resetFilter: (type) => {
        set({ [type]: defaultFilterState() });
      },
    }),
    {
      name: 'income-expense-filters',
      onRehydrateStorage: () => (state) => {
        if (state) {
          ['income', 'expense'].forEach((key) => {
            const range = (state as any)[key].dateRange;
            (state as any)[key].dateRange = {
              from: new Date(range.from),
              to: new Date(range.to),
            };
          });
        }
      },
    }
  )
);
