import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Save, Loader2, UserPlus } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { useUserRepository } from '../../../hooks/useUserRepository';
import { Input } from '../../../components/ui2/input';
import { Checkbox } from '../../../components/ui2/checkbox';
import { Button } from '../../../components/ui2/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';

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
    enabled: !!id,
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
      (async () => {
        const { data } = await supabase.rpc('get_user_roles', {
          user_id: userData.id,
        });
        setFormData({
          email: userData.email,
          password: '',
          roles: (data || []).map((r: any) => r.role_name),
          first_name: userData.raw_user_meta_data?.first_name || '',
          last_name: userData.raw_user_meta_data?.last_name || '',
        });
      })();
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
      navigate('/administration/users');
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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/users" label="Back to Users" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-foreground">
              {id ? 'Edit User' : 'Create New User'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {id
                ? 'Update user details and role assignments'
                : 'Add a new user to the system'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <label className="block text-sm font-medium text-foreground">
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
                      <label htmlFor={`role-${role.id}`} className="text-sm font-medium text-foreground">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={() => navigate('/administration/users')}>
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
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UserAddEdit;
