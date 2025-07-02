import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCategoryRepository } from '../../../hooks/useCategoryRepository';
import { useChartOfAccountRepository } from '../../../hooks/useChartOfAccountRepository';
import { Category, CategoryType } from '../../../models/category.model';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import { Textarea } from '../../../components/ui2/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import { Switch } from '../../../components/ui2/switch';
import BackButton from '../../../components/BackButton';
import { Save, Loader2, Tag } from 'lucide-react';

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: 'membership', label: 'Membership Types' },
  { value: 'member_status', label: 'Member Status' },
  { value: 'income_transaction', label: 'Income Categories' },
  { value: 'expense_transaction', label: 'Expense Categories' },
  { value: 'budget', label: 'Budget Categories' },
  { value: 'relationship_type', label: 'Relationship Types' }
];

function CategoryAddEdit() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useQuery, useCreate, useUpdate } = useCategoryRepository();
  const { useQuery: useAccountsQuery } = useChartOfAccountRepository();

  const [formData, setFormData] = useState<{ type: CategoryType } & Partial<Category>>({
    type: (searchParams.get('type') as CategoryType) || 'membership',
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

  const { data: accountsData } = useAccountsQuery();

  useEffect(() => {
    if (isEditMode && categoryData?.data?.[0]) {
      setFormData(categoryData.data[0]);
    }
  }, [isEditMode, categoryData]);

  const handleInputChange = (field: keyof Category | 'type', value: any) => {
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
        navigate(`/administration/categories/${id}`);
      } else {
        const { chart_of_accounts, ...createData } = formData as any;
        const result = await createMutation.mutateAsync({ data: createData });
        navigate(`/administration/categories/${result.id}`);
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
        <BackButton fallbackPath="/administration/categories" label="Back to Categories" />
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
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v as CategoryType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Select
                  value={formData.chart_of_account_id || undefined}
                  onValueChange={(v) => handleInputChange('chart_of_account_id', v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>None</SelectItem>
                    {accountsData?.data.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button type="button" variant="outline" onClick={() => navigate('/administration/categories')}>
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
