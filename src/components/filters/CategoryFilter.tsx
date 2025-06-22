import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryUtils } from '../../utils/categoryUtils';
import { Select } from '../ui/Select';
import { Tag, Loader2 } from 'lucide-react';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  transactionType?: string;
}

export function CategoryFilter({ value, onChange, transactionType }: CategoryFilterProps) {
  // Fetch categories from database
  const { data: categories, isLoading } = useQuery({
    queryKey: ['transaction-categories', transactionType],
    queryFn: async () => {
      if (transactionType === 'income') {
        return categoryUtils.getCategories('income_transaction');
      }

      if (transactionType === 'expense') {
        return categoryUtils.getCategories('expense_transaction');
      }

      const [income, expense] = await Promise.all([
        categoryUtils.getCategories('income_transaction'),
        categoryUtils.getCategories('expense_transaction'),
      ]);

      return [...income, ...expense];
    },
  });

  // Filter and format categories based on transaction type
  const categoryOptions = React.useMemo(() => {
    if (!categories) return [{ value: 'all', label: 'All Categories' }];

    const formatCategory = (category: { id: string; name: string }) => ({
      value: category.id,
      label: category.name,
    });

    const incomeCategories = categories
      .filter((cat) => cat.type === 'income_transaction')
      .map(formatCategory);

    const expenseCategories = categories
      .filter((cat) => cat.type === 'expense_transaction')
      .map(formatCategory);

    if (transactionType === 'income') {
      return [{ value: 'all', label: 'All Categories' }, ...incomeCategories];
    }

    if (transactionType === 'expense') {
      return [{ value: 'all', label: 'All Categories' }, ...expenseCategories];
    }

    return [
      { value: 'all', label: 'All Categories' },
      ...incomeCategories,
      ...expenseCategories,
    ];
  }, [categories, transactionType]);

  if (isLoading) {
    return (
      <div className="flex-1 min-w-[100px] relative">
        <Select
          value=""
          onChange={() => {}}
          options={[{ value: '', label: 'Loading...' }]}
          icon={<Loader2 className="animate-spin" />}
          className="w-full"
          disabled
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[100px]">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={categoryOptions}
        icon={<Tag />}
        className="w-full"
        placeholder="Select Category"
      />
    </div>
  );
}