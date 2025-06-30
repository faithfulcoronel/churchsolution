import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useRoleRepository } from '../../../hooks/useRoleRepository';
import { NotificationService } from '../../../services/NotificationService';
import { Save, Loader2, Shield } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Checkbox } from '../../../components/ui2/checkbox';
import { Button } from '../../../components/ui2/button';

type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: {
    permission: Permission;
  }[];
};

function RoleAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useQuery: useRoleQuery, useCreate, useUpdate } = useRoleRepository();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // Fetch role data if editing
  const {
    data: roleResult,
    isLoading: roleLoading,
  } = useRoleQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const role = roleResult?.data?.[0] as Role | undefined;

  // Fetch all available permissions
  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module, name');

      if (error) throw error;
      return data as Permission[];
    },
  });

  // Group permissions by module
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>) ?? {};

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions.map((rp) => rp.permission.id),
      });
    }
  }, [role]);

  const createRoleMutation = useCreate();
  const updateRoleMutation = useUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      NotificationService.showError('Role name is required', 5000);
      return;
    }

    try {
      if (id) {
        const user = (await supabase.auth.getUser()).data.user;
        await updateRoleMutation.mutateAsync({
          id,
          data: {
            name: formData.name.toLowerCase(),
            description: formData.description || null,
          },
        });
        await supabase.from('role_permissions').delete().eq('role_id', id);
        if (formData.permissions.length > 0) {
          const assignments = formData.permissions.map(pid => ({
            role_id: id,
            permission_id: pid,
            created_by: user?.id,
          }));
          await supabase.from('role_permissions').insert(assignments);
        }
      } else {
        const role = await createRoleMutation.mutateAsync({
          data: {
            name: formData.name.toLowerCase(),
            description: formData.description || null,
          },
        });
        if (role && formData.permissions.length > 0) {
          const user = (await supabase.auth.getUser()).data.user;
          const assignments = formData.permissions.map(pid => ({
            role_id: (role as any).id,
            permission_id: pid,
            created_by: user?.id,
          }));
          await supabase.from('role_permissions').insert(assignments);
        }
      }
        navigate('/administration/roles');
    } catch (error) {
      console.error('Error saving role:', error);
      if (error instanceof Error) {
        NotificationService.showError(error.message, 5000);
      }
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissionIds = groupedPermissions[module].map((p) => p.id);
    const allModulePermissionsSelected = modulePermissionIds.every((id) =>
      formData.permissions.includes(id)
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allModulePermissionsSelected
        ? prev.permissions.filter((id) => !modulePermissionIds.includes(id))
        : [...new Set([...prev.permissions, ...modulePermissionIds])],
    }));
  };

  if (roleLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/roles" label="Back to Roles" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium text-foreground">
                {id ? 'Edit Role' : 'Create New Role'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {id
                ? 'Update role details and permission assignments'
                : 'Define a new role and assign permissions'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
              <div>
                <Input
                  label="Role Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Permissions</label>
                <div className="mt-4 space-y-6">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`module-${module}`}
                          checked={modulePermissions.every((p) => formData.permissions.includes(p.id))}
                          onCheckedChange={() => handleModuleToggle(module)}
                        />
                        <label htmlFor={`module-${module}`} className="ml-2 text-sm font-medium capitalize">
                          {module}
                        </label>
                      </div>
                      <div className="ml-7 space-y-2">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`permission-${permission.id}`}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              size="sm"
                            />
                            <div className="text-sm">
                              <label htmlFor={`permission-${permission.id}`} className="font-medium text-foreground">
                                {permission.name}
                              </label>
                              {permission.description && (
                                <p className="text-muted-foreground">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate('/administration/roles')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending || updateRoleMutation.isPending}>
              {createRoleMutation.isPending || updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {id ? 'Save Changes' : 'Create Role'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default RoleAddEdit;
