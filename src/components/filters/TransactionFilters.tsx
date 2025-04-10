import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Input } from '../ui2/input';
import { Button } from '../ui2/button';
import { Badge } from '../ui2/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui2/select';
import { DatePickerInput } from '../ui2/date-picker';
import { DateRangePickerField } from '../ui2/date-range-picker-field';
import { DateRange } from '../ui2/date-range-picker';
import { AmountRangeFilter } from './AmountRangeFilter';
import { MultiSelect } from '../ui2/multi-select';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  X,
  Calendar,
  Tag,
} from 'lucide-react';

export interface TransactionFilter {
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
  categoryFilters: string[];
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min: string;
    max: string;
  };
  entityFilter: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilter;
  onFilterChange: (filters: Partial<TransactionFilter>) => void;
  onResetFilters: () => void;
  activeFilters: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onRemove: () => void;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    type?: string;
  }>;
}

export function TransactionFilters({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilters,
  categories = [],
}: TransactionFiltersProps) {
  // Convert string dates to DateRange object for the DateRangePicker
  const dateRange: DateRange = {
    from: filters.dateRange.start ? new Date(filters.dateRange.start) : undefined,
    to: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
  };

  // Handle date range changes
  const handleDateRangeChange = (range: DateRange) => {
    onFilterChange({
      dateRange: {
        start: range.from ? range.from.toISOString().split('T')[0] : '',
        end: range.to ? range.to.toISOString().split('T')[0] : ''
      }
    });
  };

  // Convert categories to options for MultiSelect
  const categoryOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Categories' }];
    
    // Group categories by type if type is available
    const incomeCategories = categories
      .filter(cat => cat.type === 'income_transaction')
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <TrendingUp className="h-3 w-3 text-success" />
      }));
    
    const expenseCategories = categories
      .filter(cat => cat.type === 'expense_transaction')
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <TrendingDown className="h-3 w-3 text-destructive" />
      }));
    
    // If no type information, just map all categories
    const otherCategories = categories
      .filter(cat => !cat.type)
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <Tag className="h-3 w-3" />
      }));
    
    return [
      ...options,
      ...incomeCategories,
      ...expenseCategories,
      ...otherCategories
    ];
  }, [categories]);

  // Handle multi-select category changes
  const handleCategoryMultiSelectChange = (selectedValues: string[]) => {
    // If "all" is selected, clear other selections
    if (selectedValues.includes('all')) {
      onFilterChange({ categoryFilters: ['all'] });
      return;
    }
    
    // If no values are selected, default to "all"
    if (selectedValues.length === 0) {
      onFilterChange({ categoryFilters: ['all'] });
      return;
    }
    
    onFilterChange({ categoryFilters: selectedValues });
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4 space-y-4">
        {/* Search and Quick Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Input
              placeholder="Search transactions..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              icon={<Search className="h-4 w-4" />}
              clearable
              onClear={() => onFilterChange({ searchTerm: '' })}
            />
          </div>

          <div>
            <Select
              value={filters.typeFilter}
              onValueChange={(value) => onFilterChange({ typeFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-success" />
                    Income
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                    Expense
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <MultiSelect
              value={filters.categoryFilters || ['all']}
              onChange={handleCategoryMultiSelectChange}
              options={categoryOptions}
              placeholder="Select Categories"
              icon={<Tag className="h-4 w-4" />}
              maxDisplay={2}
            />
          </div>

          <div>
            <Input
              placeholder="Search by member/budget..."
              value={filters.entityFilter}
              onChange={(e) => onFilterChange({ entityFilter: e.target.value })}
              clearable
              onClear={() => onFilterChange({ entityFilter: '' })}
            />
          </div>
        </div>

        {/* Date and Amount Range */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Date Range
            </label>
            <DateRangePickerField
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Amount Range
            </label>
            <AmountRangeFilter
              value={filters.amountRange}
              onChange={(value) => onFilterChange({ amountRange: value })}
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            {activeFilters.map(filter => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center space-x-1 px-2 py-1"
              >
                {filter.icon}
                <span>{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}