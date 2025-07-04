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
  const [deleting, setDeleting] = React.useState(false);

  const canEdit = transaction.status === 'draft';

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteMutation.mutateAsync(transaction.id);
    } catch (err) {
      console.error('Failed to delete transaction', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
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
                <DropdownMenuItem onClick={() => navigate(`/finances/transactions/${transaction.id}/edit`)} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" /> Edit Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'draft' && (
                <DropdownMenuItem onClick={async () => { await submitTransaction(transaction.id); }} className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Submit Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={async () => { await approveTransaction(transaction.id); }} className="flex items-center">
                  <Check className="h-4 w-4 mr-2" /> Approve Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={async () => { await updateMutation.mutateAsync({ id: transaction.id, data: { status: 'draft' } }); }} className="flex items-center">
                  <X className="h-4 w-4 mr-2" /> Reject to Draft
                </DropdownMenuItem>
              )}
              {transaction.status === 'approved' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={async () => { await postTransaction(transaction.id); }} className="flex items-center">
                  <Check className="h-4 w-4 mr-2" /> Post Transaction
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={handleDelete} className="flex items-center text-destructive" disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Transaction
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
