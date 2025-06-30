import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberList from './MemberList';
import MemberProfile from './MemberProfile';
import MemberAddEdit from './MemberAddEdit';
import FamilyRelationships from './family/FamilyRelationships';
import FamilyRelationshipProfile from './family/FamilyRelationshipProfile';
import FamilyRelationshipAddEdit from './family/FamilyRelationshipAddEdit';
import CategoryList from '../finances/configuration/CategoryList';
import CategoryAddEdit from '../finances/configuration/CategoryAddEdit';
import CategoryProfile from '../finances/configuration/CategoryProfile';

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

      {/* Configuration Routes */}
      <Route
        path="configuration/membership-types"
        element={
          <CategoryList
            categoryType="membership"
            title="Membership Types"
            description="Manage membership types."
          />
        }
      />
      <Route
        path="configuration/membership-types/add"
        element={<CategoryAddEdit categoryType="membership" basePath="/members/configuration/membership-types" />}
      />
      <Route
        path="configuration/membership-types/:id/edit"
        element={<CategoryAddEdit categoryType="membership" basePath="/members/configuration/membership-types" />}
      />
      <Route
        path="configuration/membership-types/:id"
        element={<CategoryProfile basePath="/members/configuration/membership-types" />}
      />
      <Route
        path="configuration/membership-status"
        element={
          <CategoryList
            categoryType="member_status"
            title="Membership Status"
            description="Manage membership status options."
          />
        }
      />
      <Route
        path="configuration/membership-status/add"
        element={<CategoryAddEdit categoryType="member_status" basePath="/members/configuration/membership-status" />}
      />
      <Route
        path="configuration/membership-status/:id/edit"
        element={<CategoryAddEdit categoryType="member_status" basePath="/members/configuration/membership-status" />}
      />
      <Route
        path="configuration/membership-status/:id"
        element={<CategoryProfile basePath="/members/configuration/membership-status" />}
      />
      <Route
        path="configuration/relationship-types"
        element={
          <CategoryList
            categoryType="relationship_type"
            title="Relationship Types"
            description="Manage relationship types."
          />
        }
      />
      <Route
        path="configuration/relationship-types/add"
        element={<CategoryAddEdit categoryType="relationship_type" basePath="/members/configuration/relationship-types" />}
      />
      <Route
        path="configuration/relationship-types/:id/edit"
        element={<CategoryAddEdit categoryType="relationship_type" basePath="/members/configuration/relationship-types" />}
      />
      <Route
        path="configuration/relationship-types/:id"
        element={<CategoryProfile basePath="/members/configuration/relationship-types" />}
      />
    </Routes>
  );
}

export default Members;