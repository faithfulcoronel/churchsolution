import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useRoleRepository } from '../../../hooks/useRoleRepository';
import { NotificationService } from '../../../services/NotificationService';
import { Save, Loader2, Shield } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Button } from '../../../components/ui2/button';

type Role = {
  id: string;
  name: string;
  description: string | null;
};

function RoleAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useQuery: useRoleQuery, useCreate, useUpdate } = useRoleRepository();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
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
        await updateRoleMutation.mutateAsync({
          id,
          data: {
            name: formData.name.toLowerCase(),
            description: formData.description || null,
          },
        });
      } else {
        await createRoleMutation.mutateAsync({
          data: {
            name: formData.name.toLowerCase(),
            description: formData.description || null,
          },
        });
      }
        navigate('/administration/roles');
    } catch (error) {
      console.error('Error saving role:', error);
      if (error instanceof Error) {
        NotificationService.showError(error.message, 5000);
      }
    }
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
              {id ? 'Update role details' : 'Define a new role'}
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
