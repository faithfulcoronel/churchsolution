import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui2/card';
import { Loader2 } from 'lucide-react';

const CategoryList = React.lazy(() => import('./CategoryList'));
const CategoryAddEdit = React.lazy(() => import('./CategoryAddEdit'));
const CategoryProfile = React.lazy(() => import('./CategoryProfile'));

function LoadingSpinner() {
  return (
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

function Categories() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<CategoryList />} />
        <Route path="list" element={<CategoryList />} />
        <Route path="add" element={<CategoryAddEdit />} />
        <Route path=":id/edit" element={<CategoryAddEdit />} />
        <Route path=":id" element={<CategoryProfile />} />
      </Routes>
    </Suspense>
  );
}

export default Categories;
