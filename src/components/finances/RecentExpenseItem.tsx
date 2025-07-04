import React from 'react';
import RecentTransactionItem, { TransactionItem } from './RecentTransactionItem';

export type ExpenseItem = TransactionItem;

interface Props {
  expense: ExpenseItem;
}

export default function RecentExpenseItem({ expense }: Props) {
  return (
    <RecentTransactionItem transaction={expense} transactionType="expense" />
  );
}
