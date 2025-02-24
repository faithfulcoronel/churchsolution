import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Drawer } from '../ui/Drawer';
import { DateRangeFilter } from './DateRangeFilter';
import { AmountRangeFilter } from './AmountRangeFilter';
import { TransactionTypeFilter } from './TransactionTypeFilter';
import { CategoryFilter } from './CategoryFilter';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

export interface TransactionFilter {
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
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
}

export function TransactionFilters({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilters,
}: TransactionFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <>
      <Card className="mt-6">
        <div className="p-4 space-y-4">
          {/* Mobile View */}
          <div className="flex flex-col space-y-4 lg:hidden">
            <div className="flex space-x-2">
              <Input
                placeholder="Search transactions..."
                value={filters.searchTerm}
                onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                icon={<Search />}
                clearable
                onClear={() => onFilterChange({ searchTerm: '' })}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(true)}
                icon={<SlidersHorizontal />}
                className="whitespace-nowrap"
              >
                Filters
                {activeFilters.length > 0 && (
                  <Badge
                    variant="primary"
                    className="ml-2 !px-2 !py-0.5"
                  >
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </div>

            <TransactionTypeFilter
              value={filters.typeFilter}
              onChange={(value) => onFilterChange({ typeFilter: value })}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block space-y-4">
            {/* Search and Quick Filters */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Input
                  placeholder="Search transactions..."
                  value={filters.searchTerm}
                  onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                  icon={<Search />}
                  clearable
                  onClear={() => onFilterChange({ searchTerm: '' })}
                />
              </div>

              <TransactionTypeFilter
                value={filters.typeFilter}
                onChange={(value) => onFilterChange({ typeFilter: value })}
              />

              <CategoryFilter
                value={filters.categoryFilter}
                onChange={(value) => onFilterChange({ categoryFilter: value })}
                transactionType={filters.typeFilter === 'all' ? undefined : filters.typeFilter}
              />

              <Input
                placeholder="Search by member/budget..."
                value={filters.entityFilter}
                onChange={(e) => onFilterChange({ entityFilter: e.target.value })}
                clearable
                onClear={() => onFilterChange({ entityFilter: '' })}
              />
            </div>

            {/* Date and Amount Range Filters */}
            <div className="flex gap-4">
              <DateRangeFilter
                value={filters.dateRange}
                onChange={(value) => onFilterChange({ dateRange: value })}
              />

              <AmountRangeFilter
                value={filters.amountRange}
                onChange={(value) => onFilterChange({ amountRange: value })}
              />
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
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
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                icon={<X />}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        title="Filters"
        size="lg"
      >
        <div className="space-y-6 p-4">
          <div className="space-y-4">
            <CategoryFilter
              value={filters.categoryFilter}
              onChange={(value) => onFilterChange({ categoryFilter: value })}
              transactionType={filters.typeFilter === 'all' ? undefined : filters.typeFilter}
            />

            <Input
              placeholder="Search by member/budget..."
              value={filters.entityFilter}
              onChange={(e) => onFilterChange({ entityFilter: e.target.value })}
              clearable
              onClear={() => onFilterChange({ entityFilter: '' })}
              label="Member/Budget"
            />

            <DateRangeFilter
              value={filters.dateRange}
              onChange={(value) => onFilterChange({ dateRange: value })}
            />

            <AmountRangeFilter
              value={filters.amountRange}
              onChange={(value) => onFilterChange({ amountRange: value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowAdvancedFilters(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}