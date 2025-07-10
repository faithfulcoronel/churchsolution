import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TenantsList from './TenantsList';
import TenantProfile from './TenantProfile';

function Tenants() {
  return (
    <Routes>
      <Route index element={<TenantsList />} />
      <Route path="list" element={<TenantsList />} />
      <Route path=":id" element={<TenantProfile />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
}

export default Tenants;
