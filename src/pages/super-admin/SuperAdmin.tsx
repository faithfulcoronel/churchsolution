import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './SuperAdminDashboard';
import Tenants from './Tenants';
import LicensePlans from './LicensePlans';
import MenuManagement from './MenuManagement';
import SuperAdminWelcome from './SuperAdminWelcome';

function SuperAdmin() {
  return (
    <Routes>
      <Route index element={<SuperAdminWelcome />} />
      <Route path="welcome" element={<SuperAdminWelcome />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="tenants/*" element={<Tenants />} />
      <Route path="license-plans/*" element={<LicensePlans />} />
      <Route path="menus" element={<MenuManagement />} />
      <Route path="*" element={<Navigate to="welcome" replace />} />
    </Routes>
  );
}

export default SuperAdmin;
