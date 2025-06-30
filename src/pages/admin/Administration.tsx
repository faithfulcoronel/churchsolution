import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import admin pages
import Users from './users/Users';
import Roles from './roles/Roles';
import ChurchSettings from './account-management/ChurchSettings';
import Permissions from './configuration/Permissions';

function Administration() {
  return (
    <Routes>
      <Route path="users/*" element={<Users />} />
      <Route path="roles/*" element={<Roles />} />
      <Route path="configuration/permissions/*" element={<Permissions />} />
      <Route path="account-management/church" element={<ChurchSettings />} />
      <Route path="*" element={<Navigate to="users" replace />} />
    </Routes>
  );
}

export default Administration;