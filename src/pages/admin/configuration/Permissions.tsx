import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui2/card';
import { Loader2 } from 'lucide-react';

const PermissionList = React.lazy(() => import('./PermissionList'));
const PermissionAddEdit = React.lazy(() => import('./PermissionAddEdit'));
const PermissionProfile = React.lazy(() => import('./PermissionProfile'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function Permissions() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<PermissionList />} />
        <Route path="list" element={<PermissionList />} />
        <Route path="add" element={<PermissionAddEdit />} />
        <Route path=":id/edit" element={<PermissionAddEdit />} />
        <Route path=":id" element={<PermissionProfile />} />
      </Routes>
    </Suspense>
  );
}

export default Permissions;
