import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useAccess } from '../../../utils/access';
import PermissionGate from '../../../components/PermissionGate';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { DateRangePickerField } from '../../../components/ui2/date-range-picker-field';
import { Badge } from '../../../components/ui2/badge';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { FinancialTransactionHeader } from '../../../models/financialTransactionHeader.model';
import { 
  Plus, 
  Search, 
  Calendar, 
  Loader2, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  Check,
  X,
  AlertTriangle,
  FileUp,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';
import { GridColDef } from '@mui/x-data-grid';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../../components/ui2/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui2/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/ui2/select';
import { useIncomeExpenseService } from '../../../hooks/useIncomeExpenseService';

function TransactionList() {
  const navigate = useNavigate();
  const { hasAccess } = useAccess();
  const { currency } = useCurrencyStore();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(),
  });
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransactionHeader | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Get transaction headers and actions
  const {
    useQuery,
    submitTransaction,
    approveTransaction,
    postTransaction,
    useUpdate,
  } = useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  
  const { data: result, isLoading, error } = useQuery({
    filters: {
      transaction_date: {
        operator: 'between',
        value: format(dateRange.from, 'yyyy-MM-dd'),
        valueTo: format(dateRange.to, 'yyyy-MM-dd')
      }
    },
    relationships: [
      {
        table: 'financial_sources',
        foreignKey: 'source_id',
        select: ['id', 'name', 'source_type']
      }
    ],
    order: {
      column: 'transaction_date',
      ascending: false
    }
  });
  
  const transactions = result?.data || [];
  
  const { deleteBatch } = useIncomeExpenseService('income');
  
  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);
  
  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      setDeleteInProgress(true);
      setDeleteError(null);
      
      await deleteBatch(transactionToDelete);
      
      // Close dialog after successful deletion
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setDeleteError(error instanceof Error ? error.message : 'An error occurred while deleting the transaction');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setActionInProgress(true);
      setActionError(null);

      await submitTransaction(selectedTransaction.id);

      setShowSubmitDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting the transaction'
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setActionInProgress(true);
      setActionError(null);

      await approveTransaction(selectedTransaction.id);

      setShowApproveDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error approving transaction:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'An error occurred while approving the transaction'
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePostTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      setActionInProgress(true);
      setActionError(null);

      await postTransaction(selectedTransaction.id);

      setShowPostDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error posting transaction:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'An error occurred while posting the transaction'
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEditTransaction = () => {
    if (!selectedTransaction) return;
    navigate(`/finances/transactions/${selectedTransaction.id}/edit`);
  };
  
  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    {
      field: 'transaction_date',
      headerName: 'Date',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => parse(params.row.transaction_date, 'yyyy-MM-dd', new Date()),
      renderCell: (params) =>
        format(parse(params.row.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy'),
    },
    {
      field: 'transaction_number',
      headerName: 'Transaction #',
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'reference',
      headerName: 'Reference',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'source',
      headerName: 'Source',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.source?.name || '',
      renderCell: (params) => {
        if (!params.row.source) return null;
        return (
          <div className="flex items-center">
            <span>{params.row.source.name}</span>
            <Badge variant="secondary" className="ml-2 capitalize">
              {params.row.source.source_type}
            </Badge>
          </div>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
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
            className="flex items-center"
          >
            {status === 'posted' ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Posted
              </>
            ) : status === 'voided' ? (
              <>
                <X className="h-3 w-3 mr-1" />
                Voided
              </>
            ) : status === 'approved' ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Approved
              </>
            ) : status === 'submitted' ? (
              <>
                <FileText className="h-3 w-3 mr-1" />
                Submitted
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 mr-1" />
                Draft
              </>
            )}
          </Badge>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const status = params.row.status;
        const canEdit = status === 'draft';
        
        return (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate(`/finances/transactions/${params.row.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedTransaction(params.row);
                  setShowEditDialog(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/finances/transactions/${params.row.id}`)}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowEditDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Transaction
                  </DropdownMenuItem>
                )}

                {status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowSubmitDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Transaction
                  </DropdownMenuItem>
                )}

                {status === 'submitted' && hasAccess('finance.approve', 'finance.approve') && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowApproveDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Transaction
                  </DropdownMenuItem>
                )}

                {status === 'submitted' && hasAccess('finance.approve', 'finance.approve') && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await updateMutation.mutateAsync({ id: params.row.id, data: { status: 'draft' } });
                      window.location.reload();
                    }}
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject to Draft
                  </DropdownMenuItem>
                )}

                {status === 'approved' && hasAccess('finance.approve', 'finance.approve') && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setShowPostDialog(true);
                    }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Post Transaction
                  </DropdownMenuItem>
                )}

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTransaction(params.row);
                      setTransactionToDelete(params.row.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="flex items-center text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Transaction
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage all financial transactions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-3">
            <Button
              onClick={() => navigate('/finances/transactions/add')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/finances/transactions/add')}
              className="flex items-center"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Bulk Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
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
            placeholder="Select date range"
            icon={<Calendar className="h-4 w-4" />}
          />
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Transaction List</h3>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
          <DataGrid<FinancialTransactionHeader>
            columns={columns}
            data={filteredTransactions}
            totalRows={filteredTransactions.length}
            loading={isLoading}
            error={error instanceof Error ? error.message : undefined}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            getRowId={(row) => row.id}
            onRowClick={(params) =>
              navigate(
                params.row.status === 'draft'
                  ? `/finances/transactions/${params.id}/edit`
                  : `/finances/transactions/${params.id}`
              )
            }
            autoHeight
            paginationMode="client"
            disableColumnMenu={false}
            disableColumnFilter={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            page={page}
            pageSize={pageSize}
            showQuickFilter
            storageKey="transaction-list-grid"
          />
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(selectedTransaction.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
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
                setDeleteDialogOpen(false);
                setTransactionToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Submit Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this transaction for approval?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(selectedTransaction.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowSubmitDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handleSubmitTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">Approve Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this transaction?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(selectedTransaction.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowApproveDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handleApproveTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Confirmation Dialog */}
      <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">Post Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this transaction? Once posted, it cannot be edited or deleted.
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(selectedTransaction.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowPostDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handlePostTransaction}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Edit Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit this transaction?
              {selectedTransaction && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{selectedTransaction.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(selectedTransaction.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditTransaction}>Edit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TransactionList;