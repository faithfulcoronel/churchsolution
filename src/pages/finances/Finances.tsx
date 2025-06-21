import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent } from "../../components/ui2/card";
import { Loader2 } from 'lucide-react';
import { SubscriptionGate } from '../../components/SubscriptionGate';

// Lazy load finance components
const FinancesDashboard = React.lazy(() => import('./FinancesDashboard'));
const TransactionList = React.lazy(() => import('./TransactionList'));
const TransactionAdd = React.lazy(() => import('./TransactionAdd'));
const TransactionDetail = React.lazy(() => import('./TransactionDetail'));
const BulkTransactionEntry = React.lazy(() => import('./BulkTransactionEntry'));
const BulkIncomeEntry = React.lazy(() => import('./BulkIncomeEntry'));
const BulkExpenseEntry = React.lazy(() => import('./BulkExpenseEntry'));
const BudgetList = React.lazy(() => import('./BudgetList'));
const BudgetAdd = React.lazy(() => import('./BudgetAdd'));
const BudgetProfile = React.lazy(() => import('./BudgetProfile'));
const Reports = React.lazy(() => import('./Reports'));
const JournalEntryForm = React.lazy(() => import('./JournalEntryForm'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function Finances() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<FinancesDashboard />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="transactions/add" element={
          <SubscriptionGate type="transaction">
            <TransactionAdd />
          </SubscriptionGate>
        } />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="transactions/:id/edit" element={
          <SubscriptionGate type="transaction">
            <TransactionAdd />
          </SubscriptionGate>
        } />
        <Route path="transactions/:id/bulk" element={
          <SubscriptionGate type="transaction">
            <BulkTransactionEntry />
          </SubscriptionGate>
        } />
        <Route path="transactions/bulk" element={
          <SubscriptionGate type="transaction">
            <BulkTransactionEntry />
          </SubscriptionGate>
        } />
        <Route path="transactions/bulk-income" element={
          <SubscriptionGate type="transaction">
            <BulkIncomeEntry />
          </SubscriptionGate>
        } />
        <Route path="transactions/bulk-expense" element={
          <SubscriptionGate type="transaction">
            <BulkExpenseEntry />
          </SubscriptionGate>
        } />
        <Route path="budgets" element={<BudgetList />} />
        <Route path="budgets/add" element={<BudgetAdd />} />
        <Route path="budgets/:id" element={<BudgetProfile />} />
        <Route path="reports" element={<Reports />} />
        <Route path="journal-entry" element={<JournalEntryForm />} />
      </Routes>
    </Suspense>
  );
}

export default Finances;