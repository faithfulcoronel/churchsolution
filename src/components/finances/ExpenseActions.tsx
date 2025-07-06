import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui2/dropdown-menu';
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
import { Button } from '../ui2/button';
import { useFinancialTransactionHeaderRepository } from '../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseService } from '../../hooks/useIncomeExpenseService';
import { usePermissions } from '../../hooks/usePermissions';
import { hasAccess } from '../../utils/access';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import type { ExpenseItem } from './RecentExpenseItem';
import {
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  Check,
  X,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseActionsProps {
  expense: ExpenseItem;
}

export default function ExpenseActions({ expense }: ExpenseActionsProps) {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const {
    submitTransaction,
    approveTransaction,
    postTransaction,
    useUpdate,
  } = useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  const { deleteTransaction } = useIncomeExpenseService('expense');

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [showApproveDialog, setShowApproveDialog] = React.useState(false);
  const [showPostDialog, setShowPostDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const canEdit = expense.header?.status === 'draft';

  const displayName = expense.accounts?.name ||
    (expense.member ? `${expense.member.first_name} ${expense.member.last_name}` : 'Anonymous');

  const info = (
    <div className="mt-4 border rounded-md p-3 text-left space-y-1">
      <p className="font-medium">{displayName}</p>
      <p className="text-sm text-muted-foreground">{expense.categories?.name || 'Uncategorized'}</p>
      <p className="text-sm text-muted-foreground">{format(new Date(expense.transaction_date), 'MMM d, yyyy')}</p>
      <p className="text-sm text-muted-foreground">{formatCurrency(expense.amount, currency)}</p>
    </div>
  );

  const handleDelete = async () => {
    try {
      setActionInProgress(true);
      setActionError(null);
      await deleteTransaction(expense.id);
      setShowDeleteDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete expense');
      console.error('Failed to delete expense', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSubmit = async () => {
    if (!expense.header_id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await submitTransaction(expense.header_id);
      setShowSubmitDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit expense');
      console.error('Failed to submit expense', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApprove = async () => {
    if (!expense.header_id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await approveTransaction(expense.header_id);
      setShowApproveDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve expense');
      console.error('Failed to approve expense', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    if (!expense.header_id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await updateMutation.mutateAsync({ id: expense.header_id, data: { status: 'draft' } });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject expense');
      console.error('Failed to reject expense', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePost = async () => {
    if (!expense.header_id) return;
    try {
      setActionInProgress(true);
      setActionError(null);
      await postTransaction(expense.header_id);
      setShowPostDialog(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to post expense');
      console.error('Failed to post expense', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleEdit = () => {
    if (!expense.header_id) return;
    navigate(`/finances/expenses/${expense.header_id}/edit`);
  };

  const handleView = () => {
    if (!expense.header_id) return;
    navigate(`/finances/expenses/${expense.header_id}`);
  };

  return (
    <>
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleView}>
          <Eye className="h-4 w-4" />
        </Button>
        {canEdit && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView} className="flex items-center">
              <Eye className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {expense.header?.status === 'draft' && (
              <DropdownMenuItem onClick={() => setShowSubmitDialog(true)} className="flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Submit
              </DropdownMenuItem>
            )}
            {expense.header?.status === 'submitted' && hasAccess('finance.approve', 'finance.approve') && (
              <DropdownMenuItem onClick={() => setShowApproveDialog(true)} className="flex items-center">
                <Check className="h-4 w-4 mr-2" /> Approve
              </DropdownMenuItem>
            )}
            {expense.header?.status === 'submitted' && hasAccess('finance.approve', 'finance.approve') && (
              <DropdownMenuItem onClick={handleReject} className="flex items-center">
                <X className="h-4 w-4 mr-2" /> Reject
              </DropdownMenuItem>
            )}
            {expense.header?.status === 'approved' && hasAccess('finance.approve', 'finance.approve') && (
              <DropdownMenuItem onClick={() => setShowPostDialog(true)} className="flex items-center">
                <Check className="h-4 w-4 mr-2" /> Post
              </DropdownMenuItem>
            )}
            {canEdit && (
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="flex items-center text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Edit Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit this expense?
              {info}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEdit}>Edit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense?
              {info}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setActionError(null); }} disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={actionInProgress}>
              {actionInProgress ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="default">Submit Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this expense for approval?
              {info}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowSubmitDialog(false); setActionError(null); }} disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={actionInProgress}>
              {actionInProgress ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">Approve Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this expense?
              {info}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowApproveDialog(false); setActionError(null); }} disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionInProgress}>
              {actionInProgress ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...</>) : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Confirmation Dialog */}
      <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">Post Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this expense? Once posted, it cannot be edited or deleted.
              {info}
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowPostDialog(false); setActionError(null); }} disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePost} disabled={actionInProgress}>
              {actionInProgress ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</>) : 'Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
