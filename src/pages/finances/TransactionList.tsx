import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { usePagination } from '../../hooks/usePagination';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { TransactionFilters, TransactionFilter } from '../../components/filters/TransactionFilters';
import {
  Plus,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  PiggyBank,
  Tag,
} from 'lucide-react';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  member?: {
    first_name: string;
    last_name: string;
  };
  budget?: {
    name: string;
  };
};

type SortField = 'date' | 'type' | 'category' | 'description' | 'member' | 'amount';
type SortDirection = 'asc' | 'desc';

function TransactionList() {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const [filters, setFilters] = useState<TransactionFilter>({
    searchTerm: '',
    typeFilter: 'all',
    categoryFilter: 'all',
    dateRange: {
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    },
    amountRange: {
      min: '',
      max: '',
    },
    entityFilter: '',
  });

  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({
    field: 'date',
    direction: 'desc',
  });

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', currentTenant?.id, filters.dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          member:member_id (
            first_name,
            last_name
          ),
          budget:budget_id (
            name
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!currentTenant?.id,
  });

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: 
        current.field === field && current.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (transaction.member && 
        `${transaction.member.first_name} ${transaction.member.last_name}`
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())) ||
      (transaction.budget?.name &&
        transaction.budget.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    const matchesType = filters.typeFilter === 'all' || transaction.type === filters.typeFilter;
    const matchesCategory = filters.categoryFilter === 'all' || transaction.category === filters.categoryFilter;
    
    const matchesAmount = 
      (!filters.amountRange.min || transaction.amount >= parseFloat(filters.amountRange.min)) &&
      (!filters.amountRange.max || transaction.amount <= parseFloat(filters.amountRange.max));

    const matchesEntity = !filters.entityFilter || (
      (transaction.member && 
        `${transaction.member.first_name} ${transaction.member.last_name}`
          .toLowerCase()
          .includes(filters.entityFilter.toLowerCase())) ||
      (transaction.budget?.name &&
        transaction.budget.name.toLowerCase().includes(filters.entityFilter.toLowerCase()))
    );
    
    return matchesSearch && matchesType && matchesCategory && matchesAmount && matchesEntity;
  }).sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.field) {
      case 'date':
        return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount':
        return direction * (a.amount - b.amount);
      case 'type':
        return direction * a.type.localeCompare(b.type);
      case 'category':
        return direction * a.category.localeCompare(b.category);
      case 'description':
        return direction * a.description.localeCompare(b.description);
      case 'member':
        const aMember = a.member ? `${a.member.first_name} ${a.member.last_name}` : '';
        const bMember = b.member ? `${b.member.first_name} ${b.member.last_name}` : '';
        return direction * aMember.localeCompare(bMember);
      default:
        return 0;
    }
  });

  const { 
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({
    totalItems: filteredTransactions?.length || 0,
  });

  const paginatedTransactions = filteredTransactions?.slice(startIndex, endIndex);

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const activeFilters = [
    filters.typeFilter !== 'all' && {
      id: 'type',
      label: filters.typeFilter === 'income' ? 'Income' : 'Expense',
      icon: filters.typeFilter === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      onRemove: () => handleFilterChange({ typeFilter: 'all' }),
    },
    filters.categoryFilter !== 'all' && {
      id: 'category',
      label: formatStatus(filters.categoryFilter),
      icon: <Tag className="h-4 w-4" />,
      onRemove: () => handleFilterChange({ categoryFilter: 'all' }),
    },
    (filters.amountRange.min || filters.amountRange.max) && {
      id: 'amount',
      label: `${filters.amountRange.min ? `Min: ${formatCurrency(parseFloat(filters.amountRange.min), currency)}` : ''} ${
        filters.amountRange.max ? `Max: ${formatCurrency(parseFloat(filters.amountRange.max), currency)}` : ''
      }`.trim(),
      icon: <DollarSign className="h-4 w-4" />,
      onRemove: () => handleFilterChange({ amountRange: { min: '', max: '' } }),
    },
    filters.entityFilter && {
      id: 'entity',
      label: `Entity: ${filters.entityFilter}`,
      icon: <Users className="h-4 w-4" />,
      onRemove: () => handleFilterChange({ entityFilter: '' }),
    },
  ].filter(Boolean);

  const handleFilterChange = (newFilters: Partial<TransactionFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      typeFilter: 'all',
      categoryFilter: 'all',
      dateRange: {
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      },
      amountRange: {
        min: '',
        max: '',
      },
      entityFilter: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/finances')}
          icon={<ChevronLeft />}
        >
          Back to Finances
        </Button>
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all financial transactions including income and expenses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <SubscriptionGate type="transaction">
            <Button
              variant="primary"
              onClick={() => navigate('/finances/transactions/add')}
              icon={<Plus />}
            >
              Add Transaction
            </Button>
          </SubscriptionGate>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        activeFilters={activeFilters}
      />

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
        <Card className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('date')}
                      icon={<Calendar />}
                      className="!p-0 hover:bg-transparent"
                    >
                      Date
                    </Button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('category')}
                      icon={<Tag />}
                      className="!p-0 hover:bg-transparent"
                    >
                      Category
                    </Button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('member')}
                      icon={<Users />}
                      className="!p-0 hover:bg-transparent"
                    >
                      Member/Budget
                    </Button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('amount')}
                      icon={<DollarSign />}
                      className="!p-0 hover:bg-transparent"
                    >
                      Amount
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={transaction.type === 'income' ? 'success' : 'danger'}
                        icon={transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                      >
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatStatus(transaction.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {transaction.type === 'income' ? (
                          transaction.member && (
                            <>
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              {transaction.member.first_name} {transaction.member.last_name}
                            </>
                          )
                        ) : (
                          transaction.budget?.name && (
                            <>
                              <PiggyBank className="h-4 w-4 text-gray-400 mr-1" />
                              {transaction.budget.name}
                            </>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span
                        className={
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {formatCurrency(transaction.amount, currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredTransactions?.length || 0}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </Card>
      ) : (
        <Card className="mt-6 text-center py-8">
          <p className="text-sm text-gray-500">
            {filters.searchTerm || filters.typeFilter !== 'all' || filters.categoryFilter !== 'all'
              ? 'No transactions found matching your search criteria'
              : 'No transactions found. Add your first transaction by clicking the "Add Transaction" button above.'}
          </p>
        </Card>
      )}
    </div>
  );
}

export default TransactionList;