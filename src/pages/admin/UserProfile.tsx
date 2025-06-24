import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserRepository } from '../../hooks/useUserRepository';
import { Loader2, Edit2 } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui2/button';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useQuery: useUserQuery } = useUserRepository();
  const { data: result, isLoading, error } = useUserQuery({
    filters: { id: { operator: 'eq', value: id } },
    relationships: [
      {
        table: 'user_roles',
        foreignKey: 'user_id',
        nestedRelationships: [
          { table: 'roles', foreignKey: 'role_id', select: ['name'] }
        ]
      }
    ],
    enabled: !!id
  });
  const user = result?.data?.[0];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">User not found.</p>
        <BackButton fallbackPath="/settings/administration/users" label="Back to Users" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton fallbackPath="/settings/administration/users" label="Back to Users" />

      <div className="bg-white shadow sm:rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{user.email}</h2>
          <Button variant="outline" onClick={() => navigate(`/settings/administration/users/${id}/edit`)} className="flex items-center">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium">{user.raw_user_meta_data?.first_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">{user.raw_user_meta_data?.last_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Sign In</p>
            <p className="font-medium">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Roles</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.user_roles?.map((r: any, i: number) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {r.roles?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
