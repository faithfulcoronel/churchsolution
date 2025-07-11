import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Card, CardContent } from "../../components/ui2/card";
import { Loader2 } from 'lucide-react';
import { SubscriptionGate } from '../../components/SubscriptionGate';

// Lazy load finance components
const FinancialOverviewDashboard = React.lazy(() => import('./FinancialOverviewDashboard'));
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
const FinancialReportsPage = React.lazy(() => import('./FinancialReportsPage'));
const Statements = React.lazy(() => import('./Statements'));
const IncomeExpenseList = React.lazy(() => import('./incomeExpense/IncomeExpenseList'));
const IncomeExpenseAddEdit = React.lazy(() => import('./incomeExpense/IncomeExpenseAddEdit'));
const IncomeExpenseProfile = React.lazy(() => import('./incomeExpense/IncomeExpenseProfile'));
const CategoryList = React.lazy(() => import('./configuration/CategoryList'));
const CategoryAddEdit = React.lazy(() => import('./configuration/CategoryAddEdit'));
const CategoryProfile = React.lazy(() => import('./configuration/CategoryProfile'));
const WeeklyGivingImport = React.lazy(() => import('./WeeklyGivingImport'));
const OpeningBalanceList = React.lazy(() => import('./opening-balances/OpeningBalanceList'));
const OpeningBalanceProfile = React.lazy(() => import('./opening-balances/OpeningBalanceProfile'));
const OpeningBalanceAddEdit = React.lazy(() => import('./opening-balances/OpeningBalanceAddEdit'));
const FiscalYearList = React.lazy(() => import('./fiscal-years/FiscalYearList'));
const FiscalYearProfile = React.lazy(() => import('./fiscal-years/FiscalYearProfile'));
const FiscalYearAddEdit = React.lazy(() => import('./fiscal-years/FiscalYearAddEdit'));

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
        <Route index element={<FinancialOverviewDashboard />} />
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
        <Route path="opening-balances" element={<OpeningBalanceList />} />
        <Route path="opening-balances/add" element={<OpeningBalanceAddEdit />} />
        <Route path="opening-balances/:id/edit" element={<OpeningBalanceAddEdit />} />
        <Route path="opening-balances/:id" element={<OpeningBalanceProfile />} />
        <Route path="fiscal-years" element={<FiscalYearList />} />
        <Route path="fiscal-years/add" element={<FiscalYearAddEdit />} />
        <Route path="fiscal-years/:id/edit" element={<FiscalYearAddEdit />} />
        <Route path="fiscal-years/:id" element={<FiscalYearProfile />} />
        <Route
          path="configuration/donation-categories"
          element={
            <CategoryList
              categoryType="income_transaction"
              title="Donation Categories"
              description="Manage donation categories."
            />
          }
        />
        <Route
          path="configuration/donation-categories/add"
          element={<CategoryAddEdit categoryType="income_transaction" basePath="/finances/configuration/donation-categories" />}
        />
        <Route
          path="configuration/donation-categories/:id/edit"
          element={<CategoryAddEdit categoryType="income_transaction" basePath="/finances/configuration/donation-categories" />}
        />
        <Route
          path="configuration/donation-categories/:id"
          element={<CategoryProfile basePath="/finances/configuration/donation-categories" />}
        />
        <Route
          path="configuration/expense-categories"
          element={
            <CategoryList
              categoryType="expense_transaction"
              title="Expense Categories"
              description="Manage expense categories."
            />
          }
        />
        <Route
          path="configuration/expense-categories/add"
          element={<CategoryAddEdit categoryType="expense_transaction" basePath="/finances/configuration/expense-categories" />}
        />
        <Route
          path="configuration/expense-categories/:id/edit"
          element={<CategoryAddEdit categoryType="expense_transaction" basePath="/finances/configuration/expense-categories" />}
        />
        <Route
          path="configuration/expense-categories/:id"
          element={<CategoryProfile basePath="/finances/configuration/expense-categories" />}
        />
        <Route
          path="configuration/budget-categories"
          element={
            <CategoryList
              categoryType="budget"
              title="Budget Categories"
              description="Manage budget categories."
            />
          }
        />
        <Route
          path="configuration/budget-categories/add"
          element={<CategoryAddEdit categoryType="budget" basePath="/finances/configuration/budget-categories" />}
        />
        <Route
          path="configuration/budget-categories/:id/edit"
          element={<CategoryAddEdit categoryType="budget" basePath="/finances/configuration/budget-categories" />}
        />
        <Route
          path="configuration/budget-categories/:id"
          element={<CategoryProfile basePath="/finances/configuration/budget-categories" />}
        />
        <Route path="expenses" element={<IncomeExpenseList transactionType="expense" />} />
        <Route path="expenses/add" element={<IncomeExpenseAddEdit transactionType="expense" />} />
        <Route path="expenses/:id/edit" element={<IncomeExpenseAddEdit transactionType="expense" />} />
        <Route path="expenses/:id" element={<IncomeExpenseProfile transactionType="expense" />} />
        <Route path="giving" element={<IncomeExpenseList transactionType="income" />} />
        <Route path="giving/add" element={<IncomeExpenseAddEdit transactionType="income" />} />
        <Route path="giving/import" element={<WeeklyGivingImport />} />
        <Route path="giving/:id/edit" element={<IncomeExpenseAddEdit transactionType="income" />} />
        <Route path="giving/:id" element={<IncomeExpenseProfile transactionType="income" />} />
        <Route path="reports" element={<Reports />} />
        <Route path="financial-reports" element={<FinancialReportsPage />} />
        <Route path="statements" element={<Statements />} />
      </Routes>
    </Suspense>
  );
}

export default Finances;