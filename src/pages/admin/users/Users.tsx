import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserList from './UserList';
import UserProfile from './UserProfile';
import UserAddEdit from './UserAddEdit';

function Users() {
  return (
    <Routes>
      <Route index element={<UserList />} />
      <Route path="list" element={<UserList />} />
      <Route path="add" element={<UserAddEdit />} />
      <Route path=":id" element={<UserProfile />} />
      <Route path=":id/edit" element={<UserAddEdit />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
}

export default Users;
