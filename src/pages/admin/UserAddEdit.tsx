import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, UserPlus } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useUserRepository } from '../../hooks/useUserRepository';
import { Input } from '../../components/ui2/input';
import { Checkbox } from '../../components/ui2/checkbox';
import { Button } from '../../components/ui2/button';

type UserFormData = {
  email: string;
  password: string;
  roles: string[];
  first_name: string;
  last_name: string;
};

const UserAddEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useQuery: useUserQuery, useCreate, useUpdate } = useUserRepository();
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    roles: [],
    first_name: '',
    last_name: '',
  });

  const { data: userResult, isLoading: userLoading } = useUserQuery({
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
  const userData = userResult?.data?.[0];

  // Fetch available roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        email: userData.email,
        password: '',
        roles: userData.user_roles?.map((r: any) => r.roles?.name) || [],
        first_name: userData.raw_user_meta_data?.first_name || '',
        last_name: userData.raw_user_meta_data?.last_name || '',
      });
    }
  }, [userData]);

  const createUserMutation = useCreate();
  const updateUserMutation = useUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    try {
      if (id) {
        await updateUserMutation.mutateAsync({ id, data: formData });
      } else {
        await createUserMutation.mutateAsync({ data: formData });
      }
      navigate('/settings/administration/users');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/settings/administration/users" label="Back to Users" />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {id ? 'Edit User' : 'Create New User'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {id
              ? 'Update user details and role assignments'
              : 'Add a new user to the system'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  type="email"
                  label={`Email Address ${!id ? '*' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required={!id}
                  disabled={!!id}
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>

              <div>
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  type="password"
                  label={id ? 'New Password (optional)' : 'Password *'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!id}
                  minLength={6}
                  placeholder={id ? 'Leave blank to keep current password' : '••••••'}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Roles
                </label>
                <div className="mt-2 space-y-2">
                  {roles?.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.roles.includes(role.name)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            roles: checked
                              ? [...prev.roles, role.name]
                              : prev.roles.filter((name) => name !== role.name),
                          }));
                        }}
                      />
                      <label htmlFor={`role-${role.id}`} className="text-sm font-medium text-gray-700">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" type="button" onClick={() => navigate('/settings/administration/users')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : id ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddEdit;
