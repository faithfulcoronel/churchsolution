import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import DonationActions from './DonationActions';
import ExpenseActions from './ExpenseActions';
import type { TransactionType } from '../../models/financialTransaction.model';

export interface TransactionItem {
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
  transaction: TransactionItem;
  transactionType: TransactionType;
}

export default function RecentTransactionItem({ transaction, transactionType }: Props) {
  const { currency } = useCurrencyStore();
  const name = transaction.member
    ? `${transaction.member.first_name} ${transaction.member.last_name}`
    : 'Anonymous';
  const displayName = transaction.accounts?.name || name;

  return (
    <Card size="sm" hoverable className="dark:bg-gray-600">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {transaction.member?.profile_picture_url && (
              <AvatarImage
                src={transaction.member.profile_picture_url}
                alt={name}
                crossOrigin="anonymous"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-semibold">
              {transaction.accounts?.name
                ? transaction.accounts.name
                    .split(' ')
                    .map(word => word.charAt(0))
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.transaction_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold text-foreground">
              {formatCurrency(transaction.amount, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.categories?.name || 'Uncategorized'}
            </p>
          </div>
          {transactionType === 'income' ? (
            <DonationActions donation={transaction} />
          ) : (
            <ExpenseActions expense={transaction} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
