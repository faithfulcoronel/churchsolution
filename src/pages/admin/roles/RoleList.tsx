import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoleRepository } from '../../../hooks/useRoleRepository';
import { usePermissions } from '../../../hooks/usePermissions';
import PermissionGate from '../../../components/PermissionGate';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Role } from '../../../models/role.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../components/ui2/table';
import { Badge } from '../../../components/ui2/badge';

function RoleList() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');

  const { useQuery, useDelete } = useRoleRepository();

  const { data: result, isLoading } = useQuery({
    order: { column: 'name' },
    enabled: hasPermission('role.view'),
  });
  const roles = (result?.data as Role[]) || [];

  const deleteRoleMutation = useDelete();

  const handleDelete = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRoleMutation.mutateAsync(roleId);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleEdit = (roleId: string) => {
    navigate(`/administration/roles/${roleId}/edit`);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Roles</h1>
          <p className="text-muted-foreground">Manage roles and their associated permissions.</p>
        </div>
        <PermissionGate permission="role.create">
          <Link to="/administration/roles/add">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="max-w-xs">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search roles..."
          icon={<Search className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRoles && filteredRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium capitalize">
                      {role.name}
                    </TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((rp, index) => (
                          <Badge key={index} variant="secondary">
                            {rp.permission.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permission="role.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(role.id)}
                            icon={<Edit2 className="h-4 w-4" />}
                          />
                        </PermissionGate>
                        <PermissionGate permission="role.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(role.id)}
                            disabled={deleteRoleMutation.isPending}
                            icon={
                              deleteRoleMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )
                            }
                          />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm
                ? 'No roles found matching your search criteria'
                : 'No roles found. Add your first role by clicking the "Add Role" button above.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleList;

