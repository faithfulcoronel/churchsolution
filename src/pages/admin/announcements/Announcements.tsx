import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AnnouncementList from './AnnouncementList';
import AnnouncementAddEdit from './AnnouncementAddEdit';

function Announcements() {
  return (
    <Routes>
      <Route index element={<AnnouncementList />} />
      <Route path="list" element={<AnnouncementList />} />
      <Route path="add" element={<AnnouncementAddEdit />} />
      <Route path=":id/edit" element={<AnnouncementAddEdit />} />
      <Route path="*" element={<Navigate to="list" replace />} />
    </Routes>
  );
}

export default Announcements;
