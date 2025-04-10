import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui2/select';
import { Badge } from '../../components/ui2/badge';
import { Card, CardContent } from '../../components/ui2/card';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { DateRange } from '../../components/ui2/date-range-picker';
import { MultiSelect } from '../../components/ui2/multi-select';
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
  Search,
  Filter,
  X
} from 'lucide-react';
import { GridColDef, GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category_id: string;
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
  category?: {
    name: string;
  };
};

function TransactionList() {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['all']);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [entityFilter, setEntityFilter] = useState('');
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  
  // Sorting state
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'date', sort: 'desc' },
  ]);

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  // Get transactions with category info
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', currentTenant?.id, dateRange, paginationModel, sortModel],
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
          ),
          category:category_id (
            name
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .gte('date', dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '')
        .lte('date', dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!currentTenant?.id,
  });

  // Get categories
  const { data: categories } = useQuery({
    queryKey: ['categories', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .in('type', ['income_transaction', 'expense_transaction'])
        .is('deleted_at', null)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Filter and calculate totals
  const { filteredData, totals } = React.useMemo(() => {
    const filtered = (transactions || []).filter((transaction) => {
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.member && 
          `${transaction.member.first_name} ${transaction.member.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (transaction.budget?.name &&
          transaction.budget.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      // Check if transaction category is in the selected categories or if 'all' is selected
      const matchesCategory = 
        categoryFilters.includes('all') || 
        categoryFilters.includes(transaction.category_id);
      
      const matchesEntity = !entityFilter || (
        (transaction.member && 
          `${transaction.member.first_name} ${transaction.member.last_name}`
            .toLowerCase()
            .includes(entityFilter.toLowerCase())) ||
        (transaction.budget?.name &&
          transaction.budget.name.toLowerCase().includes(entityFilter.toLowerCase()))
      );
      
      return matchesSearch && matchesType && matchesCategory && matchesEntity;
    });

    // Calculate totals
    const totalIncome = filtered.reduce((sum, t) => 
      t.type === 'income' ? sum + t.amount : sum, 0
    );
    const totalExpenses = filtered.reduce((sum, t) => 
      t.type === 'expense' ? sum + t.amount : sum, 0
    );

    return {
      filteredData: filtered,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses
      }
    };
  }, [transactions, searchTerm, typeFilter, categoryFilters, entityFilter]);

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Badge
          variant={params.value === 'income' ? 'success' : 'destructive'}
          className="flex items-center space-x-1"
        >
          {params.value === 'income' ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span>{params.value}</span>
        </Badge>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.category?.name || 'Uncategorized',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'entity',
      headerName: 'Member/Budget',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => {
        const transaction = params.row;
        if (transaction.type === 'income' && transaction.member) {
          return `${transaction.member.first_name} ${transaction.member.last_name}`;
        } else if (transaction.type === 'expense' && transaction.budget?.name) {
          return transaction.budget.name;
        }
        return '';
      },
      renderCell: (params) => {
        const transaction = params.row;
        return (
          <div className="flex items-center">
            {transaction.type === 'income' ? (
              transaction.member && (
                <>
                  <Users className="h-4 w-4 text-muted-foreground mr-1" />
                  {transaction.member.first_name} {transaction.member.last_name}
                </>
              )
            ) : (
              transaction.budget?.name && (
                <>
                  <PiggyBank className="h-4 w-4 text-muted-foreground mr-1" />
                  {transaction.budget.name}
                </>
              )
            )}
          </div>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      headerAlign: 'right',
      align: 'right',
      valueFormatter: (params) => formatCurrency(params.value, currency),
      renderCell: (params) => (
        <div className="text-right font-medium">
          <span
            className={
              params.row.type === 'income'
                ? 'text-success'
                : 'text-destructive'
            }
          >
            {formatCurrency(params.value, currency)}
          </span>
        </div>
      ),
    },
  ];

  const handlePaginationModelChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  const handleSortModelChange = (newModel: GridSortModel) => {
    setSortModel(newModel);
  };

  const handleFilterModelChange = (newModel: GridFilterModel) => {
    // Map MUI filter model to our custom filters if needed
    console.log('Filter model changed:', newModel);
  };

  const handleRowClick = (params: any) => {
    // Navigate to transaction details or open edit modal
    console.log('Row clicked:', params.row);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilters(['all']);
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setEntityFilter('');
  };

  // Convert categories to options for MultiSelect
  const categoryOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Categories' }];
    
    // Group categories by type if type is available
    const incomeCategories = categories
      ?.filter(cat => cat.type === 'income_transaction')
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <TrendingUp className="h-3 w-3 text-success" />
      })) || [];
    
    const expenseCategories = categories
      ?.filter(cat => cat.type === 'expense_transaction')
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <TrendingDown className="h-3 w-3 text-destructive" />
      })) || [];
    
    // If no type information, just map all categories
    const otherCategories = categories
      ?.filter(cat => !cat.type)
      .map(cat => ({
        value: cat.id,
        label: cat.name,
        icon: <Tag className="h-3 w-3" />
      })) || [];
    
    return [
      ...options,
      ...incomeCategories,
      ...expenseCategories,
      ...otherCategories
    ];
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/finances')}
          className="flex items-center"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Finances
        </Button>
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all financial transactions including income and expenses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <SubscriptionGate type="transaction">
            <Button
              variant="default"
              onClick={() => navigate('/finances/transactions/add')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </SubscriptionGate>
        </div>
      </div>

      {/* Filters */}
      <Card className="mt-6">
        <CardContent className="p-4 space-y-4">
          {/* Search and Quick Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                clearable
                onClear={() => setSearchTerm('')}
              />
            </div>

            <div>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
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
                value={categoryFilters}
                onChange={setCategoryFilters}
                options={categoryOptions}
                placeholder="Select Categories"
                icon={<Tag className="h-4 w-4" />}
                maxDisplay={2}
              />
            </div>

            <div>
              <Input
                placeholder="Search by member/budget..."
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                clearable
                onClear={() => setEntityFilter('')}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Date Range
              </label>
              <DateRangePickerField
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
              />
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || typeFilter !== 'all' || !categoryFilters.includes('all') || entityFilter) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1 px-2 py-1"
                >
                  <Search className="h-3 w-3" />
                  <span>{searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {typeFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1 px-2 py-1"
                >
                  {typeFilter === 'income' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{typeFilter === 'income' ? 'Income' : 'Expense'}</span>
                  <button
                    onClick={() => setTypeFilter('all')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {!categoryFilters.includes('all') && categoryFilters.map(catId => {
                const category = categories?.find(c => c.id === catId);
                return category ? (
                  <Badge
                    key={catId}
                    variant="secondary"
                    className="flex items-center space-x-1 px-2 py-1"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{category.name}</span>
                    <button
                      onClick={() => setCategoryFilters(prev => 
                        prev.filter(id => id !== catId).length ? 
                          prev.filter(id => id !== catId) : 
                          ['all']
                      )}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              
              {entityFilter && (
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1 px-2 py-1"
                >
                  <Users className="h-3 w-3" />
                  <span>{entityFilter}</span>
                  <button
                    onClick={() => setEntityFilter('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="mt-6">
        {isLoading ? (
          <Card>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <DataGrid
            columns={columns}
            data={filteredData}
            loading={isLoading}
            totalRows={filteredData.length}
            onRowClick={handleRowClick}
            onPageChange={(page) => setPaginationModel({ ...paginationModel, page })}
            onPageSizeChange={(pageSize) => setPaginationModel({ ...paginationModel, pageSize })}
            onSortChange={handleSortModelChange}
            onFilterChange={handleFilterModelChange}
            pagination={{
              pageSize: paginationModel.pageSize,
              pageSizeOptions: [5, 10, 25, 50, 100],
            }}
            exportOptions={{
              enabled: true,
              fileName: 'transactions',
              pdf: true,
              excel: true,
            }}
            title="Transactions"
            description={dateRange.from && dateRange.to ? 
              `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 
              'All Transactions'
            }
            toolbar={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/finances/transactions/bulk')}
              >
                Bulk Entry
              </Button>
            }
          />
        )}
      </div>

      {/* Summary Card */}
      {!isLoading && filteredData.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-success">
                  <TrendingUp className="h-5 w-5 mr-1 inline-block" />
                  <span className="font-semibold">
                    Income: {formatCurrency(totals.income, currency)}
                  </span>
                </div>
                <div className="text-destructive">
                  <TrendingDown className="h-5 w-5 mr-1 inline-block" />
                  <span className="font-semibold">
                    Expenses: {formatCurrency(totals.expenses, currency)}
                  </span>
                </div>
              </div>
              <div className={totals.balance >= 0 ? 'text-success' : 'text-destructive'}>
                <span className="font-semibold">
                  Net: {formatCurrency(Math.abs(totals.balance), currency)}
                  {totals.balance >= 0 ? ' (Profit)' : ' (Loss)'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TransactionList;