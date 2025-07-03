import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberList from './MemberList';
const MembersDashboard = React.lazy(() => import("./MembersDashboard"));
import MemberProfile from './MemberProfile';
import MemberAddEdit from './MemberAddEdit';
import FamilyRelationships from './family/FamilyRelationships';
import FamilyRelationshipProfile from './family/FamilyRelationshipProfile';
import FamilyRelationshipAddEdit from './family/FamilyRelationshipAddEdit';
import MembershipTypeList from './configuration/MembershipTypeList';
import MembershipTypeAddEdit from './configuration/MembershipTypeAddEdit';
import MembershipTypeProfile from './configuration/MembershipTypeProfile';
import MembershipStatusList from './configuration/MembershipStatusList';
import MembershipStatusAddEdit from './configuration/MembershipStatusAddEdit';
import MembershipStatusProfile from './configuration/MembershipStatusProfile';
import CategoryList from '../finances/configuration/CategoryList';
import CategoryAddEdit from '../finances/configuration/CategoryAddEdit';
import CategoryProfile from '../finances/configuration/CategoryProfile';

function Members() {
  return (
    <Routes>
      <Route index element={<MembersDashboard />} />
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
      <Route path="configuration/membership-types" element={<MembershipTypeList />} />
      <Route path="configuration/membership-types/add" element={<MembershipTypeAddEdit />} />
      <Route path="configuration/membership-types/:id/edit" element={<MembershipTypeAddEdit />} />
      <Route path="configuration/membership-types/:id" element={<MembershipTypeProfile />} />
      <Route path="configuration/membership-status" element={<MembershipStatusList />} />
      <Route path="configuration/membership-status/add" element={<MembershipStatusAddEdit />} />
      <Route path="configuration/membership-status/:id/edit" element={<MembershipStatusAddEdit />} />
      <Route path="configuration/membership-status/:id" element={<MembershipStatusProfile />} />
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