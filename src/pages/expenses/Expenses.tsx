import React from 'react';
import { Routes, Route } from 'react-router-dom';
const ExpensesDashboard = React.lazy(() => import('./ExpensesDashboard'));

function Expenses() {
  return (
    <Routes>
      <Route index element={<ExpensesDashboard />} />
    </Routes>
  );
}

export default Expenses;
