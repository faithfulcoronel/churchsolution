import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useRoleRepository } from '../../../hooks/useRoleRepository';
import BackButton from '../../../components/BackButton';
import { NotificationService } from '../../../services/NotificationService';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Checkbox } from '../../../components/ui2/checkbox';
import { Button } from '../../../components/ui2/button';
import { Loader2, Shield } from 'lucide-react';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: { permission: Permission }[];
}

function RolePermissions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById, updatePermissions } = useRoleRepository();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: role, isLoading } = useFindById(id || '', {});

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

  const groupedPermissions = permissions?.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {}) ?? {};

  useEffect(() => {
    if (role) {
      setSelected(role.permissions.map(rp => rp.permission.id));
    }
  }, [role]);

  const togglePermission = (pid: string) => {
    setSelected(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const toggleModule = (module: string) => {
    const ids = groupedPermissions[module].map(p => p.id);
    const allSelected = ids.every(i => selected.includes(i));
    setSelected(prev =>
      allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updatePermissions(id, selected);
      NotificationService.showSuccess('Permissions updated');
      navigate(`/administration/roles/${id}`);
    } catch (error) {
      console.error('Error updating permissions:', error);
      if (error instanceof Error) {
        NotificationService.showError(error.message, 5000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!role) {
    return (
      <Card>
        <CardContent className="py-12 text-center">Role not found</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/roles" label="Back to Roles" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Edit Role Permissions</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(groupedPermissions).length === 0 && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id={`module-${module}`}
                  checked={perms.every(p => selected.includes(p.id))}
                  onCheckedChange={() => toggleModule(module)}
                />
                <label htmlFor={`module-${module}`} className="ml-2 font-medium capitalize">
                  {module}
                </label>
              </div>
              <div className="ml-7 space-y-2">
                {perms.map(p => (
                  <div key={p.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`perm-${p.id}`}
                      size="sm"
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => togglePermission(p.id)}
                    />
                    <div className="text-sm">
                      <label htmlFor={`perm-${p.id}`} className="font-medium text-foreground">
                        {p.name}
                      </label>
                      {p.description && (
                        <p className="text-muted-foreground">{p.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate(`/administration/roles/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RolePermissions;
