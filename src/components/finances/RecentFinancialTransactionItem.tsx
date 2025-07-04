import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FinancialTransactionHeader } from '../../models/financialTransactionHeader.model';
import { Card, CardContent } from '../ui2/card';
import { Badge } from '../ui2/badge';
import { Button } from '../ui2/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui2/dropdown-menu';
import {
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { useFinancialTransactionHeaderRepository } from '../../hooks/useFinancialTransactionHeaderRepository';
import { usePermissions } from '../../hooks/usePermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui2/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  transaction: FinancialTransactionHeader;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  posted: 'success',
  approved: 'warning',
  submitted: 'info',
  draft: 'secondary',
  voided: 'destructive',
};

export default function RecentTransactionItem({ transaction }: Props) {
  const navigate = useNavigate();
  const {
    submitTransaction,
    approveTransaction,
    postTransaction,
    useUpdate,
    useDelete,
  } = useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();
  const { hasPermission } = usePermissions();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showPostDialog, setShowPostDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const canEdit = transaction.status === 'draft';

  const handleDelete = async () => {
    try {
      setActionInProgress(true);
      setActionError(null);
      await deleteMutation.mutateAsync(transaction.id);
      setShowDeleteDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete transaction');
      console.error('Failed to delete transaction', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setActionInProgress(true);
      setActionError(null);
      await submitTransaction(transaction.id);
      setShowSubmitDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit transaction');
      console.error('Failed to submit transaction', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionInProgress(true);
      setActionError(null);
      await approveTransaction(transaction.id);
      setShowApproveDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve transaction');
      console.error('Failed to approve transaction', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePost = async () => {
    try {
      setActionInProgress(true);
      setActionError(null);
      await postTransaction(transaction.id);
      setShowPostDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to post transaction');
      console.error('Failed to post transaction', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEdit = () => {
    navigate(`/finances/transactions/${transaction.id}/edit`);
  };

  return (
    <>
      <Card size="sm" hoverable className="dark:bg-gray-600">
        <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{transaction.transaction_number}</span>
            <span className="text-sm text-muted-foreground">
              {transaction.description || 'No description'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
            </span>
            <Badge variant={statusVariantMap[transaction.status] || 'secondary'} className="capitalize">
              {transaction.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finances/transactions/${transaction.id}`)} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => setShowSubmitDialog(true)}
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" /> Submit Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem
                  onClick={() => setShowApproveDialog(true)}
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" /> Approve Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={async () => { await updateMutation.mutateAsync({ id: transaction.id, data: { status: 'draft' } }); }} className="flex items-center">
                  <X className="h-4 w-4 mr-2" /> Reject to Draft
                </DropdownMenuItem>
              )}
              {transaction.status === 'approved' && hasPermission('finance.approve') && (
                <DropdownMenuItem
                  onClick={() => setShowPostDialog(true)}
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" /> Post Transaction
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Transaction
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction?
              <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                <p className="font-medium">{transaction.transaction_number}</p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.transaction_date), 'MMM d, yyyy')}</p>
              </div>
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
                setShowDeleteDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
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
              <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                <p className="font-medium">{transaction.transaction_number}</p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.transaction_date), 'MMM d, yyyy')}</p>
              </div>
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
              <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                <p className="font-medium">{transaction.transaction_number}</p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.transaction_date), 'MMM d, yyyy')}</p>
              </div>
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

      {/* Post Confirmation Dialog */}
      <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">Post Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this transaction? Once posted, it cannot be edited or deleted.
              <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                <p className="font-medium">{transaction.transaction_number}</p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.transaction_date), 'MMM d, yyyy')}</p>
              </div>
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

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Edit Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit this transaction?
              <div className="mt-4 border rounded-md p-3 text-left space-y-1">
                <p className="font-medium">{transaction.transaction_number}</p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(transaction.transaction_date), 'MMM d, yyyy')}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEdit}>Edit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
