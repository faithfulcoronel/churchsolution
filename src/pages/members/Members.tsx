import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberList from './MemberList';
import MemberProfile from './MemberProfile';
import MemberAddEdit from './MemberAddEdit';
import FamilyRelationships from './family/FamilyRelationships';
import FamilyRelationshipProfile from './family/FamilyRelationshipProfile';
import FamilyRelationshipAddEdit from './family/FamilyRelationshipAddEdit';

function Members() {
  return (
    <Routes>
      {/* Member Routes */}
      <Route path="list" element={<MemberList />} />
      <Route path="add" element={<MemberAddEdit />} />
      <Route path=":id" element={<MemberProfile />} />
      <Route path=":id/edit" element={<MemberAddEdit />} />

      {/* Family Relationship Routes */}
      <Route path="family" element={<FamilyRelationships />} />
      <Route path="family/add" element={<FamilyRelationshipAddEdit />} />
      <Route path="family/:id" element={<FamilyRelationshipProfile />} />
      <Route path="family/:id/edit" element={<FamilyRelationshipAddEdit />} />
    </Routes>
  );
}

export default Members;