import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui2/card';
import { Loader2 } from 'lucide-react';

// Lazy load account components
const AccountList = React.lazy(() => import('./account/AccountList'));
const AccountAddEdit = React.lazy(() => import('./account/AccountAddEdit'));
const AccountProfile = React.lazy(() => import('./account/AccountProfile'));
const FinancialSourceList = React.lazy(() => import('./financial-sources/FinancialSourceList'));
const FinancialSourceAddEdit = React.lazy(() => import('./financial-sources/FinancialSourceAddEdit'));
const FinancialSourceProfile = React.lazy(() => import('./financial-sources/FinancialSourceProfile'));
const ChartOfAccountList = React.lazy(() => import('./chart-of-accounts/ChartOfAccountList'));
const ChartOfAccountAddEdit = React.lazy(() => import('./chart-of-accounts/ChartOfAccountAddEdit'));
const ChartOfAccountProfile = React.lazy(() => import('./chart-of-accounts/ChartOfAccountProfile'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function Accounts() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<AccountList />} />
        <Route path="list" element={<AccountList />} />
        <Route path="add" element={<AccountAddEdit />} />
        <Route path=":id/edit" element={<AccountAddEdit />} />
        <Route path=":id" element={<AccountProfile />} />
        
        {/* Financial Sources Routes */}
        <Route path="sources" element={<FinancialSourceList />} />
        <Route path="sources/add" element={<FinancialSourceAddEdit />} />
        <Route path="sources/:id/edit" element={<FinancialSourceAddEdit />} />
        <Route path="sources/:id" element={<FinancialSourceProfile />} />
        
        {/* Chart of Accounts Routes */}
        <Route path="chart-of-accounts" element={<ChartOfAccountList />} />
        <Route path="chart-of-accounts/add" element={<ChartOfAccountAddEdit />} />
        <Route path="chart-of-accounts/:id/edit" element={<ChartOfAccountAddEdit />} />
        <Route path="chart-of-accounts/:id" element={<ChartOfAccountProfile />} />
      </Routes>
    </Suspense>
  );
}

export default Accounts;