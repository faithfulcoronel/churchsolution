import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PermissionGate from "../../../components/PermissionGate";
import { usePermissions } from "../../../hooks/usePermissions";
import { Plus, Edit2, Trash2, Loader2, Search, Filter } from "lucide-react";
import { useUserRepository } from "../../../hooks/useUserRepository";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../../components/ui2/input";
import { Card, CardHeader, CardContent } from "../../../components/ui2/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../../components/ui2/alert-dialog";
import { Button } from "../../../components/ui2/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/ui2/table";
import { Badge } from "../../../components/ui2/badge";

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles?: string[];
};

function Users() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { useQuery: useUsersQuery, useDelete } = useUserRepository();

  const { data: result, isLoading } = useUsersQuery({
    enabled: hasPermission("user.view"),
  });

  const users = result?.data as any[] | undefined;

  const [rolesMap, setRolesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoles = async () => {
      if (!users) return;
      const map: Record<string, string> = {};
      for (const u of users) {
        const { data } = await supabase.rpc("get_user_roles", {
          user_id: u.id,
        });
        map[u.id] = (data || [])[0]?.role_name || "";
      }
      setRolesMap(map);
    };
    loadRoles();
  }, [users]);

  const deleteUserMutation = useDelete();

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUserMutation.mutateAsync(userToDelete.id);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleEdit = (user: User) => {
    navigate(`/administration/users/${user.id}/edit`);
  };

  const filteredUsers = users?.filter((user) => {
    if (!user) return false;

    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-muted-foreground">
            A list of all users in your church including their roles and
            permissions.
          </p>
        </div>
        <PermissionGate permission="user.create">
          <Link to="/administration/users/add">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </PermissionGate>
      </div>

      <div className="max-w-xs">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          icon={<Search className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {rolesMap[user.id] && (
                        <Badge variant="secondary">{rolesMap[user.id]}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <PermissionGate permission="user.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            icon={<Edit2 className="h-4 w-4" />}
                          />
                        </PermissionGate>
                        <PermissionGate permission="user.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={deleteUserMutation.isPending}
                            icon={
                              deleteUserMutation.isPending ? (
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
                ? "No users found matching your search criteria"
                : 'No users found. Add your first user by clicking the "Add User" button above.'}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.email}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Users;
