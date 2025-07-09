import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoleRepository } from '../../../hooks/useRoleRepository';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import PermissionGate from '../../../components/PermissionGate';
import { Badge } from '../../../components/ui2/badge';
import { Loader2, Shield, Pencil, Trash2, ListChecks } from 'lucide-react';

function RoleProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useQuery, useDelete } = useRoleRepository();
  const { data: roleData, isLoading } = useQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const deleteMutation = useDelete();

  const role = roleData?.data?.[0];

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate('/administration/roles');
      } catch (err) {
        console.error('Error deleting role', err);
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
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/roles" label="Back to Roles" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="h-6 w-6 mr-2 text-primary" />
              {role.name}
            </h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('edit')} className="flex items-center">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <PermissionGate permission="role.edit">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/administration/roles/${id}/menus`)}
                  className="flex items-center"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Menus
                </Button>
              </PermissionGate>
              <Button variant="destructive" onClick={handleDelete} className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-sm text-foreground col-span-2">{role.description || '-'}</dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-muted-foreground">Permissions</dt>
              <dd className="text-sm text-foreground col-span-2">
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.map((rp, i) => (
                    <Badge key={i} variant="secondary">
                      {rp.permission.name}
                    </Badge>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleProfile;

