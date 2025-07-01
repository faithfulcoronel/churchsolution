import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMembershipTypeRepository } from '../../../hooks/useMembershipTypeRepository';
import { MembershipType } from '../../../models/membershipType.model';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Switch } from '../../../components/ui2/switch';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Save, Loader2, Tag } from 'lucide-react';

function MembershipTypeAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useQuery, useCreate, useUpdate } = useMembershipTypeRepository();

  const [formData, setFormData] = useState<Partial<MembershipType>>({
    code: '',
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });
  const [errors, setErrors] = useState<{ code?: string; name?: string; general?: string }>({});

  const { data: typeData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && typeData?.data?.[0]) {
      setFormData(typeData.data[0]);
    }
  }, [isEditMode, typeData]);

  const handleInputChange = (field: keyof MembershipType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.code?.trim()) newErrors.code = 'Code is required';
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, data: formData });
        navigate(`/members/configuration/membership-types/${id}`);
      } else {
        const result = await createMutation.mutateAsync({ data: formData });
        navigate(`/members/configuration/membership-types/${result.id}`);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, general: err instanceof Error ? err.message : 'Error saving membership type' }));
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
        <BackButton fallbackPath="/members/configuration/membership-types" label="Back" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Tag className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Edit Membership Type' : 'Add New Membership Type'}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                {errors.general}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Code"
                  value={formData.code || ''}
                  onChange={e => handleInputChange('code', e.target.value)}
                  error={errors.code}
                  required
                />
              </div>
              <div>
                <Input
                  label="Name"
                  value={formData.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
              </div>
              <div>
                <Input
                  type="number"
                  label="Sort Order"
                  value={formData.sort_order ?? 0}
                  onChange={e => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description || ''}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2 flex items-center space-x-2">
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={checked => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate('/members/configuration/membership-types')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Type' : 'Create Type'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default MembershipTypeAddEdit;
