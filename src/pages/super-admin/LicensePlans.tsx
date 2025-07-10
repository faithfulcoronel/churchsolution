import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LicensePlanList from './LicensePlanList';
import LicensePlanEdit from './LicensePlanEdit';

function LicensePlans() {
  return (
    <Routes>
      <Route index element={<LicensePlanList />} />
      <Route path="list" element={<LicensePlanList />} />
      <Route path="add" element={<LicensePlanEdit />} />
      <Route path=":id/edit" element={<LicensePlanEdit />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
}

export default LicensePlans;
