import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { format } from 'date-fns';
import { DataGrid } from '../../../components/ui2/data-grid';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Badge } from '../../../components/ui2/badge';
import { Container } from '../../../components/ui2/container';
import {
  Plus,
  Users,
  Heart,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../../components/ui2/alert-dialog';

type FamilyRelationship = {
  id: string;
  member_id: string;
  related_member_id: string;
  relationship_category_id: string;
  notes: string;
  created_at: string;
  member: {
    first_name: string;
    last_name: string;
  };
  related_member: {
    first_name: string;
    last_name: string;
  };
  category: {
    name: string;
    code: string;
  };
};

function FamilyRelationships() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  // Get relationship categories
  const { data: categories } = useQuery({
    queryKey: ['categories', 'relationship_type', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', currentTenant?.id)
        .eq('type', 'relationship_type')
        .is('deleted_at', null)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    enabled: !!currentTenant?.id,
  });

  // Get family relationships
  const { data: relationships, isLoading } = useQuery({
    queryKey: ['family-relationships', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          *,
          member:member_id (
            first_name,
            last_name
          ),
          related_member:related_member_id (
            first_name,
            last_name
          ),
          category:relationship_category_id (
            name,
            code
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FamilyRelationship[];
    },
    enabled: !!currentTenant?.id,
  });

  const columns = [
    {
      accessorKey: 'member',
      header: 'Member',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <span>
            {row.original.member.first_name} {row.original.member.last_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'relationship',
      header: 'Relationship',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-primary" />
          <Badge variant="secondary">
            {row.original.category.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'related_member',
      header: 'Related Member',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <span>
            {row.original.related_member.first_name} {row.original.related_member.last_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy'),
    },
  ];

  const filterFields = [
    {
      id: 'member',
      label: 'Member',
      type: 'text' as const,
    },
    {
      id: 'relationship_category_id',
      label: 'Relationship Type',
      type: 'select' as const,
      options: categories?.map(c => ({
        value: c.id,
        label: c.name
      })) || [],
    },
    {
      id: 'related_member',
      label: 'Related Member',
      type: 'text' as const,
    },
  ];

  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <BackButton fallbackPath="/members" label="Back to Members" />

          <Button
            variant="default"
            onClick={() => navigate('/members/family/add')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Family Relationships</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage family relationships and connections between members
          </p>
        </div>

        {/* Data Grid */}
        <DataGrid
          columns={columns}
          data={relationships || []}
          loading={isLoading}
          filterFields={filterFields}
          onRowClick={(row) => navigate(`/members/family/${row.id}`)}
          rowActions={(row) => (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/members/family/${row.id}/edit`);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(row.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
          pagination={{
            pageSize: 10,
            pageSizeOptions: [5, 10, 20, 50, 100],
          }}
          exportOptions={{
            enabled: true,
            fileName: 'family-relationships',
            pdf: true,
            excel: true,
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this family relationship? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deletingId) {
                    const { error } = await supabase
                      .from('family_relationships')
                      .delete()
                      .eq('id', deletingId);

                    if (error) {
                      console.error('Error deleting relationship:', error);
                    }
                    setDeletingId(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Container>
  );
}

export default FamilyRelationships;