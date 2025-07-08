import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleList from './RoleList';
import RoleAddEdit from './RoleAddEdit';
import RoleProfile from './RoleProfile';
import RolePermissions from './RolePermissions';
import RoleMenus from './RoleMenus';

function Roles() {
  return (
    <Routes>
      <Route index element={<RoleList />} />
      <Route path="list" element={<RoleList />} />
      <Route path="add" element={<RoleAddEdit />} />
      <Route path=":id" element={<RoleProfile />} />
      <Route path=":id/edit" element={<RoleAddEdit />} />
      <Route path=":id/permissions" element={<RolePermissions />} />
      <Route path=":id/menus" element={<RoleMenus />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
}

export default Roles;

