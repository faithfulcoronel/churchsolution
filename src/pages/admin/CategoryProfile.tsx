import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import BackButton from '../../components/BackButton';
import { Badge } from '../../components/ui2/badge';
import { Loader2, Tag, Pencil, Trash2 } from 'lucide-react';

function CategoryProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useQuery, useDelete } = useCategoryRepository();
  const { data: categoryData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id
  });
  const deleteMutation = useDelete();

  const category = categoryData?.data?.[0];

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate('/settings/administration/categories');
      } catch (err) {
        console.error('Error deleting category', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <Card>
        <CardContent className="py-12 text-center">Category not found</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/settings/administration/categories" label="Back to Categories" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <Tag className="h-6 w-6 mr-2 text-primary" />
              {category.name}
              <Badge variant="secondary" className="ml-3 capitalize">
                {category.type.replace('_', ' ')}
              </Badge>
            </h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('edit')} className="flex items-center" disabled={category.is_system}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex items-center" disabled={category.is_system}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Code</dt>
              <dd className="text-sm text-foreground col-span-2">{category.code}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-sm text-foreground col-span-2">{category.description || '-'}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="text-sm text-foreground col-span-2">
                <Badge variant={category.is_active ? 'success' : 'secondary'}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Sort Order</dt>
              <dd className="text-sm text-foreground col-span-2">{category.sort_order}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Account</dt>
              <dd className="text-sm text-foreground col-span-2">
                {category.chart_of_accounts ? `${category.chart_of_accounts.code} - ${category.chart_of_accounts.name}` : '-'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default CategoryProfile;
