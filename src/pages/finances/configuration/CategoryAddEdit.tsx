import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryRepository } from '../../../hooks/useCategoryRepository';
import { useChartOfAccounts } from '../../../hooks/useChartOfAccounts';
import { Category, CategoryType } from '../../../models/category.model';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import { Textarea } from '../../../components/ui2/textarea';
import { Combobox } from '../../../components/ui2/combobox';
import { Switch } from '../../../components/ui2/switch';
import BackButton from '../../../components/BackButton';
import { Save, Loader2, Tag } from 'lucide-react';

interface CategoryAddEditProps {
  categoryType: CategoryType;
  basePath: string;
}

function CategoryAddEdit({ categoryType, basePath }: CategoryAddEditProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useQuery, useCreate, useUpdate } = useCategoryRepository();
  const { useAccountOptions } = useChartOfAccounts();

  const [formData, setFormData] = useState<Partial<Category>>({
    type: categoryType,
    code: '',
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
    chart_of_account_id: null
  });
  const [errors, setErrors] = useState<{ code?: string; name?: string; general?: string }>({});

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEditMode
  });

  const accountTypeFilter =
    categoryType === 'income_transaction'
      ? 'revenue'
      : categoryType === 'expense_transaction'
        ? 'expense'
        : undefined;
  const { data: accountOptions, isLoading: isAccountsLoading } = useAccountOptions(accountTypeFilter);

  useEffect(() => {
    if (isEditMode && categoryData?.data?.[0]) {
      setFormData(categoryData.data[0]);
    }
  }, [isEditMode, categoryData]);

  const handleInputChange = (field: keyof Category, value: any) => {
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
        const { chart_of_accounts, ...updateData } = formData as any;
        await updateMutation.mutateAsync({ id: id!, data: updateData });
        navigate(`${basePath}/${id}`);
      } else {
        const { chart_of_accounts, ...createData } = formData as any;
        const result = await createMutation.mutateAsync({ data: createData });
        navigate(`${basePath}/${result.id}`);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, general: err instanceof Error ? err.message : 'Error saving category' }));
    }
  };

  if (isEditMode && isCategoryLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath={basePath} label="Back to Categories" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Tag className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Edit Category' : 'Add New Category'}
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
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  error={errors.code}
                  required
                />
              </div>
              <div>
                <Input
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Chart of Account</label>
                {isAccountsLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading accounts...</span>
                  </div>
                ) : (
                  <Combobox
                    options={accountOptions || []}
                    value={formData.chart_of_account_id || ''}
                    onChange={(v) => handleInputChange('chart_of_account_id', v || null)}
                    placeholder="Select account"
                    className="w-full"
                  />
                )}
              </div>
              <div>
                <Input
                  type="number"
                  label="Sort Order"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2 flex items-center space-x-2">
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate(basePath)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update Category' : 'Create Category'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default CategoryAddEdit;
