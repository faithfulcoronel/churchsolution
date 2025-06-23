import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useChartOfAccountRepository } from '../../hooks/useChartOfAccountRepository';
import { useAccountingReports } from '../../hooks/useAccountingReports';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import BackButton from '../../components/BackButton';
import { Badge } from '../../components/ui2/badge';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui2/alert-dialog';
import { 
  BookOpen,
  Pencil, 
  Trash2, 
  Loader2, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Calendar,
  FileText,
  Clock,
  FileSpreadsheet,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { GridColDef } from '@mui/x-data-grid';

function ChartOfAccountProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
    to: new Date(),
  });
  
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Get account details
  const { useQuery, useDelete } = useChartOfAccountRepository();
  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    relationships: [
      {
        table: 'chart_of_accounts',
        foreignKey: 'parent_id',
        select: ['id', 'code', 'name', 'account_type']
      }
    ],
    enabled: !!id
  });
  
  const account = accountData?.data?.[0];
  
  // Get account balance
  const { useAccountBalance, useAccountTransactions } = useAccountingReports();
  const { data: balance, isLoading: isBalanceLoading } = useAccountBalance(
    id || '', 
    dateRange.to.toISOString().split('T')[0]
  );
  
  // Get account transactions
  const { data: transactions, isLoading: isTransactionsLoading } = useAccountTransactions(
    id || '',
    dateRange.from.toISOString().split('T')[0],
    dateRange.to.toISOString().split('T')[0]
  );
  
  // Delete mutation
  const deleteMutation = useDelete();
  
  // Handle account deletion
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleteInProgress(true);
      setDeleteError(null);
      
      await deleteMutation.mutateAsync(id);
      navigate('/accounts/chart-of-accounts');
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error instanceof Error ? error.message : 'An error occurred while deleting the account');
    } finally {
      setDeleteInProgress(false);
    }
  };
  
  // Export transactions to CSV
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Transaction #', 'Description', 'Debit', 'Credit', 'Status'];
    const rows = transactions.map(tx => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.header?.transaction_number || '',
      tx.description,
      tx.debit || '',
      tx.credit || '',
      tx.header?.status || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `account_${account?.code}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => new Date(params.row.date),
      renderCell: (params) => format(new Date(params.row.date), 'MMM d, yyyy'),
    },
    {
      field: 'transaction_number',
      headerName: 'Transaction #',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) => params.row.header?.transaction_number || '-',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'debit',
      headerName: 'Debit',
      flex: 1,
      minWidth: 120,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => 
        params.value ? formatCurrency(params.value, currency) : '',
    },
    {
      field: 'credit',
      headerName: 'Credit',
      flex: 1,
      minWidth: 120,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => 
        params.value ? formatCurrency(params.value, currency) : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => params.row.header?.status || 'draft',
      renderCell: (params) => {
        const status = params.value;
        return (
          <Badge
            variant={
              status === 'posted'
                ? 'success'
                : status === 'voided'
                ? 'destructive'
                : status === 'approved'
                ? 'warning'
                : status === 'submitted'
                ? 'info'
                : 'secondary'
            }
          >
            {status === 'posted'
              ? 'Posted'
              : status === 'voided'
              ? 'Voided'
              : status === 'approved'
              ? 'Approved'
              : status === 'submitted'
              ? 'Submitted'
              : 'Draft'}
          </Badge>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (params.row.header?.id) {
                navigate(`/finances/transactions/${params.row.header.id}`);
              }
            }}
            disabled={!params.row.header?.id}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [currency, navigate]);

  // Prepare data for DataGrid
  const transactionRows = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((tx, index) => ({
      id: tx.id || `tx-${index}`,
      ...tx,
    }));
  }, [transactions]);
  
  if (isAccountLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!account) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Account not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The account you're looking for doesn't exist or has been deleted.
          </p>
          <BackButton
            fallbackPath="/accounts/chart-of-accounts"
            label="Back to Chart of Accounts"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/accounts/chart-of-accounts" label="Back to Chart of Accounts" />
      </div>
      
      {/* Account Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-foreground">{account.name}</h2>
                  <Badge 
                    variant={account.is_active ? 'success' : 'secondary'}
                    className="ml-3"
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <span className="font-mono">{account.code}</span>
                  <span className="mx-2">•</span>
                  <Badge variant="secondary" className="capitalize">
                    {account.account_type}
                  </Badge>
                  {account.account_subtype && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{account.account_subtype}</span>
                    </>
                  )}
                </div>
                {account.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{account.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/accounts/chart-of-accounts/${id}/edit`)}
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Account Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Account Details</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h4>
                <dl className="divide-y divide-border">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Code</dt>
                    <dd className="text-sm font-mono text-foreground col-span-2">{account.code}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Name</dt>
                    <dd className="text-sm text-foreground col-span-2">{account.name}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                    <dd className="text-sm text-foreground col-span-2 capitalize">
                      <Badge variant="secondary" className="capitalize">
                        {account.account_type}
                      </Badge>
                    </dd>
                  </div>
                  {account.account_subtype && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Subtype</dt>
                      <dd className="text-sm text-foreground col-span-2 capitalize">
                        {account.account_subtype}
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {account.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Information</h4>
                <dl className="divide-y divide-border">
                  {account.parent && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Parent Account</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => navigate(`/accounts/chart-of-accounts/${account.parent.id}`)}
                        >
                          {account.parent.code} - {account.parent.name}
                        </Button>
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {account.description || 'No description provided'}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {format(new Date(account.created_at), 'MMM d, yyyy')}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {format(new Date(account.updated_at), 'MMM d, yyyy')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Account Balance</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            {isBalanceLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Balance as of {format(dateRange.to, 'MMMM d, yyyy')}
                </p>
                <div className="flex items-center justify-center mb-4">
                  {balance > 0 ? (
                    <ArrowUp className="h-6 w-6 text-success mr-2" />
                  ) : balance < 0 ? (
                    <ArrowDown className="h-6 w-6 text-destructive mr-2" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-muted-foreground mr-2" />
                  )}
                  <span className={`text-2xl font-bold ${
                    balance > 0 ? 'text-success' : 
                    balance < 0 ? 'text-destructive' : 
                    'text-foreground'
                  }`}>
                    {formatCurrency(Math.abs(balance || 0), currency)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {account.account_type === 'asset' || account.account_type === 'expense' ? (
                    <p>Debit balance (increases with debits)</p>
                  ) : (
                    <p>Credit balance (increases with credits)</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Account Transactions</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePickerField
              value={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onChange={(range) => {
                if (range.from && range.to) {
                  setDateRange({
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              label="Date Range"
              icon={<Calendar className="h-4 w-4" />}
            />
            
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!transactions || transactions.length === 0}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <DataGrid
            columns={columns}
            data={transactionRows}
            loading={isTransactionsLoading}
            totalRows={transactionRows.length}
            autoHeight
            getRowId={(row) => row.id}
            exportOptions={{
              enabled: true,
              fileName: `account_${account.code}_transactions`,
            }}
            pageSize={10}
            page={0}
            pageSizeOptions={[5, 10, 25, 50, 100]}
          />
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              {transactions && transactions.length > 0 && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md text-warning flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    This account has {transactions.length} associated transactions. 
                    Deleting this account may affect financial records.
                  </span>
                </div>
              )}
              {deleteError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteError(null);
              }}
              disabled={deleteInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChartOfAccountProfile;