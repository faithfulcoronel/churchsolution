import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Textarea } from '../../../components/ui2/textarea';
import { Badge } from '../../../components/ui2/badge';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
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
import { IncomeExpenseTransaction } from '../../../models/incomeExpenseTransaction.model';
import { GridColDef } from '@mui/x-data-grid';
import {
  Loader2,
  Edit,
  FileText,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Hash,
  HandCoins,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import { format, parse } from 'date-fns';
import BackButton from '../../../components/BackButton';
import { useAccess } from '../../../utils/access';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';

interface IncomeExpenseProfileProps {
  transactionType: 'income' | 'expense';
}

function IncomeExpenseProfile({ transactionType }: IncomeExpenseProfileProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasAccess } = useAccess();
  const {
    useQuery,
    submitTransaction,
    approveTransaction,
    postTransaction,
    useUpdate,
  } = useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  const { getByHeaderId } = useIncomeExpenseTransactionRepository();
  const {
    data: headerData,
    isLoading: headerLoading,
    error: headerError,
  } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const header = headerData?.data?.[0];

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRejectReasonDialog, setShowRejectReasonDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { currency } = useCurrencyStore();

  const totalAmount = React.useMemo(
    () => entries.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [entries]
  );

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    entries.forEach(e => {
      const name = e.categories?.name || 'Uncategorized';
      totals[name] = (totals[name] || 0) + Number(e.amount || 0);
    });
    return totals;
  }, [entries]);

  useEffect(() => {
    const loadEntries = async () => {
      if (id) {
        try {
          const data = await getByHeaderId(id);
          setEntries(data || []);
        } catch (err) {
          console.error('Error loading entries:', err);
          setEntriesError(
            err instanceof Error ? err.message : 'Failed to load entries'
          );
        } finally {
          setLoading(false);
        }
      }
    };
    loadEntries();
  }, [id, getByHeaderId]);

  const columns: GridColDef[] = [
    {
      field: 'accounts',
      headerName: 'Account',
      flex: 1,
      minWidth: 150,
      valueGetter: (p) => p.row.accounts?.name,
    },
    {
      field: 'funds',
      headerName: 'Fund',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.funds?.name,
    },
    {
      field: 'categories',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.categories?.name,
    },
    {
      field: 'financial_sources',
      headerName: 'Source',
      flex: 1,
      minWidth: 120,
      valueGetter: (p) => p.row.financial_sources?.name,
    },
    { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 100 },
  ];

  const handleSubmit = async () => {
    if (!id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await submitTransaction(id);
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

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await approveTransaction(id);
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

  const handleReject = async () => {
    if (!id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await updateMutation.mutateAsync({ id, data: { status: 'draft' } });
      setShowRejectDialog(false);
      setRejectReason('');
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'An error occurred while rejecting the transaction'
      );
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePost = async () => {
    if (!id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await postTransaction(id);
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

  const basePath = transactionType === 'income' ? 'giving' : 'expenses';
  const backLabel = transactionType === 'income' ? 'Back to Donations' : 'Back to Expenses';
  const notFound = transactionType === 'income' ? 'Batch not found.' : 'Entry not found.';

  if (headerLoading || loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!header) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <BackButton fallbackPath={`/finances/${basePath}`} label="Back" />
        <p className="mt-4">{notFound}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath={`/finances/${basePath}`} label={backLabel} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                {transactionType === 'income' ? (
                  <HandCoins className="h-8 w-8 text-primary" />
                ) : (
                  <PiggyBank className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    {header.transaction_number}
                  </h2>
                  <Badge
                    variant={
                      header.status === 'posted'
                        ? 'success'
                        : header.status === 'voided'
                        ? 'destructive'
                        : header.status === 'approved'
                        ? 'warning'
                        : header.status === 'submitted'
                        ? 'info'
                        : 'secondary'
                    }
                    className="ml-3 capitalize"
                  >
                    {header.status === 'posted' ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Posted
                      </>
                    ) : header.status === 'voided' ? (
                      <>
                        <X className="h-3 w-3 mr-1" /> Voided
                      </>
                    ) : header.status === 'approved' ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Approved
                      </>
                    ) : header.status === 'submitted' ? (
                      <>
                        <FileText className="h-3 w-3 mr-1" /> Submitted
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 mr-1" /> Draft
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {format(
                      parse(header.transaction_date, 'yyyy-MM-dd', new Date()),
                      'MMM d, yyyy'
                    )}
                  </span>
                  {header.reference && (
                    <>
                      <span className="mx-2">•</span>
                      <Hash className="h-4 w-4 mr-1" />
                      <span>Ref: {header.reference}</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {header.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {header.status === 'draft' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/finances/${basePath}/${id}/edit`)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setShowSubmitDialog(true)}
                    className="flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                </>
              )}

              {header.status === 'submitted' &&
                hasAccess('finance.approve', 'finance.approve') && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => setShowApproveDialog(true)}
                      className="flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setRejectReason('');
                        setShowRejectReasonDialog(true);
                      }}
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

              {header.status === 'approved' &&
                hasAccess('finance.approve', 'finance.approve') && (
                  <Button
                    variant="default"
                    onClick={() => setShowPostDialog(true)}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
            <h3 className="text-base font-medium text-foreground">Summary</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(categoryTotals).map(([name, amt]) => (
                <tr key={name} className="border-b border-border">
                  <td className="px-4 py-1">{name}</td>
                  <td className="px-4 py-1 text-right">
                    {formatCurrency(amt, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-medium">
                <td className="px-4 py-2">Grand Total</td>
                <td className="px-4 py-2 text-right">
                  {formatCurrency(totalAmount, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-medium">Entries</h3>
        </CardHeader>
        <CardContent className="p-0">
          <DataGrid<IncomeExpenseTransaction>
            columns={columns}
            data={entries}
            totalRows={entries.length}
            loading={loading}
            error={
              entriesError ?? (headerError instanceof Error ? headerError.message : undefined)
            }
            autoHeight
            paginationMode="client"
            storageKey="income-expense-profile-entries"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            page={page}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Submit Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this transaction for approval?
              {header && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{header.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(header.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalAmount, currency)}
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
              onClick={handleSubmit}
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
              {header && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{header.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(header.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalAmount, currency)}
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
              onClick={handleApprove}
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

      {/* Reject Reason Dialog */}
      <AlertDialog open={showRejectReasonDialog} onOpenChange={setShowRejectReasonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Reject Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this transaction.
              {header && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{header.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(header.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalAmount, currency)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRejectReasonDialog(false);
                setRejectReason('');
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!rejectReason.trim()) return;
                setShowRejectReasonDialog(false);
                setShowRejectDialog(true);
              }}
              disabled={!rejectReason.trim()}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Reject Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this transaction back to draft?
              {header && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{header.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(header.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalAmount, currency)}
                  </p>
                  {rejectReason && (
                    <p className="text-sm text-muted-foreground">Reason: {rejectReason}</p>
                  )}
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
                setShowRejectDialog(false);
                setRejectReason('');
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleReject}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Transaction'
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
              {header && (
                <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                  <p className="font-medium">{header.transaction_number}</p>
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parse(header.transaction_date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalAmount, currency)}
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
              onClick={handlePost}
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
    </div>
  );
}

export default IncomeExpenseProfile;
