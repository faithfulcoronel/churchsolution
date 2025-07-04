import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { Button } from '../ui2/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui2/dropdown-menu';
import { Eye, Edit, MoreHorizontal, Check, X, Trash2 } from 'lucide-react';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import { useFinancialTransactionHeaderRepository } from '../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseService } from '../../hooks/useIncomeExpenseService';
import { usePermissions } from '../../hooks/usePermissions';

export interface DonationItem {
  id: string;
  transaction_date: string;
  amount: number;
  header_id: string | null;
  header?: { status: string } | null;
  member?: {
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
  } | null;
  accounts?: {
    name: string;
  } | null;
  categories?: {
    name: string;
  } | null;
}

interface Props {
  donation: DonationItem;
}

export default function RecentDonationItem({ donation }: Props) {
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  const {
    approveTransaction,
    postTransaction,
    useUpdate,
  } = useFinancialTransactionHeaderRepository();
  const { deleteTransaction } = useIncomeExpenseService('income');
  const updateMutation = useUpdate();
  const { hasPermission } = usePermissions();
  const [deleting, setDeleting] = React.useState(false);

  const canEdit = donation.header?.status === 'draft';

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTransaction(donation.id);
    } catch (err) {
      console.error('Failed to delete donation', err);
    } finally {
      setDeleting(false);
    }
  };
  const name = donation.member
    ? `${donation.member.first_name} ${donation.member.last_name}`
    : "Anonymous";
  const displayName = donation.accounts?.name || name;

  return (
    <Card size="sm" hoverable className="dark:bg-gray-600">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {donation.member?.profile_picture_url && (
              <AvatarImage
                src={donation.member.profile_picture_url}
                alt={name}
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-semibold">
              {donation.accounts?.name
                ? donation.accounts.name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(donation.transaction_date).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {formatCurrency(donation.amount, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {donation.categories?.name || 'Uncategorized'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/finances/giving/${donation.header_id}`)}
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/finances/giving/${donation.header_id}/edit`)
                  }
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              {donation.header?.status === 'submitted' &&
                hasPermission('finance.approve') && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await approveTransaction(donation.header_id!);
                    }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve
                  </DropdownMenuItem>
                )}
              {donation.header?.status === 'submitted' &&
                hasPermission('finance.approve') && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await updateMutation.mutateAsync({
                        id: donation.header_id!,
                        data: { status: 'draft' },
                      });
                    }}
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" /> Reject
                  </DropdownMenuItem>
                )}
              {donation.header?.status === 'approved' &&
                hasPermission('finance.approve') && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await postTransaction(donation.header_id!);
                    }}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" /> Post
                  </DropdownMenuItem>
                )}
              {canEdit && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="flex items-center text-destructive"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
