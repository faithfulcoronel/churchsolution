import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoleRepository } from '../../hooks/useRoleRepository';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { Shield, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Role } from '../../models/role.model';

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
    navigate(`/settings/administration/roles/${roleId}/edit`);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage roles and their associated permissions.
          </p>
        </div>
        <PermissionGate permission="role.create">
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/settings/administration/roles/add"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Link>
          </div>
        </PermissionGate>
      </div>

      <div className="mt-6">
        <div className="relative max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredRoles && filteredRoles.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </h3>
                    {role.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <PermissionGate permission="role.edit">
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => handleEdit(role.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate permission="role.delete">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(role.id)}
                        disabled={deleteRoleMutation.isPending}
                      >
                        {deleteRoleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <h4 className="text-sm font-medium text-gray-900">Permissions</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role.permissions.map((rp, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {rp.permission.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white shadow sm:rounded-lg mt-8">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No roles match your search criteria'
              : 'Get started by adding a new role'}
          </p>
          <PermissionGate permission="role.create">
            <div className="mt-6">
              <Link
                to="/settings/administration/roles/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Link>
            </div>
          </PermissionGate>
        </div>
      )}
    </div>
  );
}

export default RoleList;

