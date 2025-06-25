import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Card, CardContent } from "../../components/ui2/card";
import { Loader2 } from 'lucide-react';
import { SubscriptionGate } from '../../components/SubscriptionGate';

// Lazy load finance components
const FinancesDashboard = React.lazy(() => import('./FinancesDashboard'));
const TransactionList = React.lazy(() => import('./transactions/TransactionList'));
const TransactionDetail = React.lazy(() => import('./transactions/TransactionDetail'));
const BulkTransactionEntry = React.lazy(() => import('./transactions/BulkTransactionEntry'));
const BudgetList = React.lazy(() => import('./budgets/BudgetList'));
const BudgetAdd = React.lazy(() => import('./budgets/BudgetAdd'));
const BudgetProfile = React.lazy(() => import('./budgets/BudgetProfile'));
const FundList = React.lazy(() => import('./funds/FundList'));
const FundAddEdit = React.lazy(() => import('./funds/FundAddEdit'));
const FundProfile = React.lazy(() => import('./funds/FundProfile'));
const Reports = React.lazy(() => import('./Reports'));
const Statements = React.lazy(() => import('./Statements'));
const GivingList = React.lazy(() => import('./giving/GivingList'));
const GivingAddEdit = React.lazy(() => import('./giving/GivingAddEdit'));
const GivingProfile = React.lazy(() => import('./giving/GivingProfile'));
const ExpenseList = React.lazy(() => import('./expenses/ExpenseList'));
const ExpenseAddEdit = React.lazy(() => import('./expenses/ExpenseAddEdit'));
const ExpenseProfile = React.lazy(() => import('./expenses/ExpenseProfile'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function TransactionBulkRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/finances/transactions/${id}/edit`} replace />;
}

function Finances() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<FinancesDashboard />} />
        <Route path="transactions" element={<TransactionList />} />
        <Route path="transactions/add" element={
          <SubscriptionGate type="transaction">
            <BulkTransactionEntry />
          </SubscriptionGate>
        } />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="transactions/:id/edit" element={
          <SubscriptionGate type="transaction">
            <BulkTransactionEntry />
          </SubscriptionGate>
        } />
        <Route path="transactions/:id/bulk" element={<TransactionBulkRedirect />} />
        <Route path="transactions/bulk" element={<Navigate to="/finances/transactions/add" replace />} />
        <Route path="budgets" element={<BudgetList />} />
        <Route path="budgets/add" element={<BudgetAdd />} />
        <Route path="budgets/:id" element={<BudgetProfile />} />
        <Route path="funds" element={<FundList />} />
        <Route path="funds/add" element={<FundAddEdit />} />
        <Route path="funds/:id/edit" element={<FundAddEdit />} />
        <Route path="funds/:id" element={<FundProfile />} />
        <Route path="expenses" element={<ExpenseList />} />
        <Route path="expenses/add" element={<ExpenseAddEdit />} />
        <Route path="expenses/:id/edit" element={<ExpenseAddEdit />} />
        <Route path="expenses/:id" element={<ExpenseProfile />} />
        <Route path="giving" element={<GivingList />} />
        <Route path="giving/add" element={<GivingAddEdit />} />
        <Route path="giving/:id/edit" element={<GivingAddEdit />} />
        <Route path="giving/:id" element={<GivingProfile />} />
        <Route path="reports" element={<Reports />} />
        <Route path="statements" element={<Statements />} />
      </Routes>
    </Suspense>
  );
}

export default Finances;