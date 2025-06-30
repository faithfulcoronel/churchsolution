import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissionRepository } from '../../../hooks/usePermissionRepository';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2, Pencil, Trash2, KeyRound } from 'lucide-react';

function PermissionProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useQuery, useDelete } = usePermissionRepository();
  const { data: permData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const deleteMutation = useDelete();

  const permission = permData?.data?.[0];

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate('/settings/administration/configuration/permissions');
      } catch (err) {
        console.error('Error deleting permission', err);
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

  if (!permission) {
    return (
      <Card>
        <CardContent className="py-12 text-center">Permission not found</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/settings/administration/configuration/permissions" label="Back to Permissions" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <KeyRound className="h-6 w-6 mr-2 text-primary" />
              {permission.name}
            </h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('edit')} className="flex items-center">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex items-center">
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Code</dt>
              <dd className="text-sm text-foreground col-span-2">{permission.code}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Module</dt>
              <dd className="text-sm text-foreground col-span-2">{permission.module}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-sm text-foreground col-span-2">{permission.description || '-'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default PermissionProfile;
