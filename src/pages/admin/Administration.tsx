import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const AuditLog = React.lazy(() => import('../settings/AuditLog'));

// Import admin pages
import Users from './users/Users';
import Roles from './roles/Roles';
import Announcements from './announcements/Announcements';
import ChurchSettings from './account-management/ChurchSettings';
import Permissions from './configuration/Permissions';
import MenuPermissions from './MenuPermissions';
import License from './license/License';

function Administration() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users/*" element={<Users />} />
      <Route path="roles/*" element={<Roles />} />
      <Route path="announcements/*" element={<Announcements />} />
      <Route path="menu-permissions" element={<MenuPermissions />} />
      <Route path="configuration/permissions/*" element={<Permissions />} />
      <Route path="account-management/church" element={<ChurchSettings />} />
      <Route path="license" element={<License />} />
      <Route path="audit-logs" element={<AuditLog />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}export default Administration;