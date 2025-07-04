import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Badge } from '../ui2/badge';
import { Button } from '../ui2/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui2/dropdown-menu';
import { Eye, Edit, Check, X, Trash2, MoreHorizontal, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../hooks/useFinancialTransactionHeaderRepository';
import { usePermissions } from '../../hooks/usePermissions';
import type { FinancialTransactionHeader } from '../../models/financialTransactionHeader.model';

interface Props {
  transaction: FinancialTransactionHeader;
}

export default function TransactionCardItem({ transaction }: Props) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { submitTransaction, approveTransaction, postTransaction, useUpdate, useDelete } =
    useFinancialTransactionHeaderRepository();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const canEdit = transaction.status === 'draft';

  return (
    <Card size="sm" hoverable className="dark:bg-gray-600">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div>
          <p className="font-medium text-foreground">{transaction.transaction_number}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(transaction.transaction_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {transaction.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/finances/transactions/${transaction.id}`)} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => navigate(`/finances/transactions/${transaction.id}/edit`)} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Transaction
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => submitTransaction(transaction.id)} className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={() => approveTransaction(transaction.id)} className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Approve Transaction
                </DropdownMenuItem>
              )}
              {transaction.status === 'submitted' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={() => updateMutation.mutateAsync({ id: transaction.id, data: { status: 'draft' } })} className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  Reject to Draft
                </DropdownMenuItem>
              )}
              {transaction.status === 'approved' && hasPermission('finance.approve') && (
                <DropdownMenuItem onClick={() => postTransaction(transaction.id)} className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Post Transaction
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => deleteMutation.mutateAsync(transaction.id)} className="flex items-center text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Transaction
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
