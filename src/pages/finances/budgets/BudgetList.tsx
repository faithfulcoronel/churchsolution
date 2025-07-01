// src/pages/finances/BudgetList.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { categoryUtils } from '../../../utils/categoryUtils';
import { format } from 'date-fns';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Input } from '../../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import { Badge } from '../../../components/ui2/badge';
import { useMessageStore } from '../../../components/MessageHandler';
import {
  Plus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui2/alert-dialog';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';

function BudgetList() {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  // Get budget categories
  const { data: categories } = useQuery({
    queryKey: ['categories', 'budget', currentTenant?.id],
    queryFn: () => categoryUtils.getCategories('budget'),
    enabled: !!currentTenant?.id,
  });

  // Get budgets with transaction counts
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', currentTenant?.id],
    queryFn: async () => {
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:category_id (
            name
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('start_date', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Get transaction counts for each budget
      const budgetsWithUsage = await Promise.all(
        (budgets || []).map(async (budget) => {
          const { data: transactions, error: transactionsError } = await supabase
            .from('financial_transactions')
            .select('debit, credit')
            .eq('budget_id', budget.id)
            .eq('type', 'expense');

          if (transactionsError) throw transactionsError;

          const used_amount =
            transactions?.reduce(
              (sum, t) => sum + Number(t.debit || 0) - Number(t.credit || 0),
              0
            ) || 0;
          const transaction_count = transactions?.length || 0;

          return {
            ...budget,
            used_amount,
            transaction_count
          };
        })
      );

      return budgetsWithUsage;
    },
    enabled: !!currentTenant?.id,
  });

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      addMessage({
        type: 'success',
        text: 'Budget deleted successfully',
        duration: 3000,
      });
      setDeletingBudgetId(null);
    },
    onError: (error: Error) => {
      addMessage({
        type: 'error',
        text: error.message,
        duration: 5000,
      });
      setDeletingBudgetId(null);
    },
  });

  const handleDelete = (budget: any) => {
    if (budget.transaction_count > 0) {
      addMessage({
        type: 'error',
        text: 'Cannot delete budget with existing transactions',
        duration: 5000,
      });
      return;
    }
    setDeletingBudgetId(budget.id);
  };

  const today = new Date();

  const filteredBudgets = budgets?.filter((budget) => {
    const matchesSearch = 
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || budget.category_id === categoryFilter;
    
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);
    const isActive = startDate <= today && endDate >= today;
    const isUpcoming = startDate > today;
    const isExpired = endDate < today;

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'upcoming' && isUpcoming) ||
      (statusFilter === 'expired' && isExpired);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      minWidth: 180,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      valueGetter: params => params.row.category?.name,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      valueFormatter: params => formatCurrency(params.value, currency),
    },
    {
      field: 'used_amount',
      headerName: 'Used',
      flex: 1,
      minWidth: 120,
      valueFormatter: params => formatCurrency(params.value || 0, currency),
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 130,
      valueGetter: params => new Date(params.row.start_date),
      renderCell: params => format(new Date(params.row.start_date), 'MMM d, yyyy'),
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      flex: 1,
      minWidth: 130,
      valueGetter: params => new Date(params.row.end_date),
      renderCell: params => format(new Date(params.row.end_date), 'MMM d, yyyy'),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: params => {
        const start = new Date(params.row.start_date);
        const end = new Date(params.row.end_date);
        const isActive = start <= today && end >= today;
        const isUpcoming = start > today;
        return (
          <Badge variant={isActive ? 'success' : isUpcoming ? 'primary' : 'secondary'}>
            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Expired'}
          </Badge>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              navigate(`/finances/budgets/${params.row.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {params.row.transaction_count === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleDelete(params.row);
              }}
              disabled={deletingBudgetId === params.row.id}
            >
              {deletingBudgetId === params.row.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances" label="Back to Accounting" />
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Budgets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all budget allocations and their current status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/finances/budgets/add">
            <Button
              variant="default"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Input
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search />}
          />
        </div>

        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-4">
          <div className="relative">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative mt-4 sm:mt-0">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataGrid<any>
                columns={columns}
                data={filteredBudgets || []}
                totalRows={(filteredBudgets || []).length}
                loading={isLoading}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`/finances/budgets/${params.row.id}`)}
                page={page}
                pageSize={pageSize}
                paginationMode="client"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deletingBudgetId} onOpenChange={() => setDeletingBudgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Budget
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBudgetId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteBudgetMutation.mutateAsync(deletingBudgetId!);
                } catch (error) {
                  console.error('Error deleting budget:', error);
                }
              }}
            >
              {deleteBudgetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BudgetList;
