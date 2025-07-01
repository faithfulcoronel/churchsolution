import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui2/card';
import { Loader2 } from 'lucide-react';

const ThreadList = React.lazy(() => import('./ThreadList'));
const ThreadDetail = React.lazy(() => import('./ThreadDetail'));
const NewThread = React.lazy(() => import('./NewThread'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function Support() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<ThreadList />} />
        <Route path="add" element={<NewThread />} />
        <Route path=":id" element={<ThreadDetail />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </Suspense>
  );
}

export default Support;
