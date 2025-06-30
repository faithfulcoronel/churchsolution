import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserRepository } from '../../../hooks/useUserRepository';
import { Loader2, Edit2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import BackButton from '../../../components/BackButton';
import { Button } from '../../../components/ui2/button';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Badge } from '../../../components/ui2/badge';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { useQuery: useUserQuery } = useUserRepository();
  const { data: result, isLoading, error } = useUserQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });
  const user = result?.data?.[0];
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.rpc('get_user_roles', { user_id: user.id });
      setRoles((data || []).map((r: any) => r.role_name));
    };
    load();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">User not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton fallbackPath="/administration/users" label="Back to Users" />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">{user.email}</h2>
            <Button
              variant="outline"
              onClick={() => navigate(`/administration/users/${id}/edit`)}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium text-foreground">{user.raw_user_meta_data?.first_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium text-foreground">{user.raw_user_meta_data?.last_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sign In</p>
              <p className="font-medium text-foreground">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {roles.map((name, i) => (
                  <Badge key={i} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;
