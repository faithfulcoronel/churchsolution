import React from 'react';
import { Card, CardContent } from '../ui2/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
import ExpenseActions from './ExpenseActions';

export interface ExpenseItem {
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
  expense: ExpenseItem;
}

export default function RecentExpenseItem({ expense }: Props) {
  const { currency } = useCurrencyStore();
  const name = expense.member
    ? `${expense.member.first_name} ${expense.member.last_name}`
    : "Anonymous";
  const displayName = expense.accounts?.name || name;

  return (
    <Card size="sm" hoverable className="dark:bg-gray-600">
      <CardContent className="flex justify-between items-center gap-4 py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {expense.member?.profile_picture_url && (
              <AvatarImage
                src={expense.member.profile_picture_url}
                alt={name}
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 font-semibold">
              {expense.accounts?.name
                ? expense.accounts.name
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
              {new Date(expense.transaction_date).toLocaleDateString(
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
              {formatCurrency(expense.amount, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {expense.categories?.name || 'Uncategorized'}
            </p>
          </div>
          <ExpenseActions expense={expense} />
        </div>
      </CardContent>
    </Card>
  );
}
