import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissionRepository } from '../../../hooks/usePermissionRepository';
import { Permission } from '../../../models/permission.model';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Save, Loader2 } from 'lucide-react';

function PermissionAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useQuery, useCreate, useUpdate } = usePermissionRepository();

  const [formData, setFormData] = useState<Partial<Permission>>({
    code: '',
    name: '',
    module: '',
    description: '',
  });

  const { data: permData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEditMode,
  });

  const createMutation = useCreate();
  const updateMutation = useUpdate();

  useEffect(() => {
    if (isEditMode && permData?.data?.[0]) {
      setFormData(permData.data[0]);
    }
  }, [isEditMode, permData]);

  const handleInputChange = (field: keyof Permission, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: formData });
        navigate(`/settings/administration/configuration/permissions/${id}`);
      } else {
        const result = await createMutation.mutateAsync({ data: formData });
        navigate(`/settings/administration/configuration/permissions/${result.id}`);
      }
    } catch (err) {
      console.error('Error saving permission:', err);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/settings/administration/configuration/permissions" label="Back to Permissions" />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-foreground">
            {isEditMode ? 'Edit Permission' : 'Add Permission'}
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Code"
                required
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="module.action"
                className="sm:col-span-2"
              />
              <Input
                label="Name"
                required
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="sm:col-span-2"
              />
              <Input
                label="Module"
                required
                value={formData.module || ''}
                onChange={(e) => handleInputChange('module', e.target.value)}
                className="sm:col-span-2"
              />
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description (optional)"
                className="sm:col-span-2"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate('/settings/administration/configuration/permissions')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> {isEditMode ? 'Update Permission' : 'Create Permission'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PermissionAddEdit;
