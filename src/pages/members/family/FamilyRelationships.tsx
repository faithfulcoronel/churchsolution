import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { categoryUtils } from '../../../utils/categoryUtils';
import { format } from 'date-fns';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import BackButton from '../../../components/BackButton';
import { Badge } from '../../../components/ui2/badge';
import { Container } from '../../../components/ui2/container';
import {
  Plus,
  Users,
  Heart,
  Search,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { GridColDef } from '@mui/x-data-grid';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
    queryFn: () => categoryUtils.getCategories('relationship_type'),
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

  const columns: GridColDef[] = [
    {
      field: 'member',
      headerName: 'Member',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) =>
        `${params.row.member.first_name} ${params.row.member.last_name}`,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <span>
            {params.row.member.first_name} {params.row.member.last_name}
          </span>
        </div>
      ),
    },
    {
      field: 'relationship',
      headerName: 'Relationship',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) => params.row.category.name,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-primary" />
          <Badge variant="secondary">{params.row.category.name}</Badge>
        </div>
      ),
    },
    {
      field: 'related_member',
      headerName: 'Related Member',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (params) =>
        `${params.row.related_member.first_name} ${params.row.related_member.last_name}`,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-primary" />
          <span>
            {params.row.related_member.first_name} {params.row.related_member.last_name}
          </span>
        </div>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => new Date(params.row.created_at),
      renderCell: (params) =>
        format(new Date(params.row.created_at), 'MMM d, yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/members/family/${params.row.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingId(params.row.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredRelationships = (relationships || []).filter((rel) => {
    const search = searchTerm.toLowerCase();
    const memberName = `${rel.member.first_name} ${rel.member.last_name}`.toLowerCase();
    const relatedName = `${rel.related_member.first_name} ${rel.related_member.last_name}`.toLowerCase();
    const matchesSearch =
      memberName.includes(search) || relatedName.includes(search);
    const matchesType =
      typeFilter === 'all' || rel.relationship_category_id === typeFilter;
    return matchesSearch && matchesType;
  });


  return (
    <Container>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <BackButton fallbackPath="/members/list" label="Back to Members" />

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

        <div className="mt-6 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search />}
            />
          </div>

          <div className="relative mt-4 sm:mt-0">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Grid */}
        <DataGrid<FamilyRelationship>
          columns={columns}
          data={filteredRelationships}
          totalRows={filteredRelationships.length}
          loading={isLoading}
          onRowClick={(params) => navigate(`/members/family/${params.row.id}`)}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          page={page}
          pageSize={pageSize}
          getRowId={(row) => row.id}
          autoHeight
          paginationMode="client"
          storageKey="family-relationships-grid"
          disableColumnMenu={false}
          disableColumnFilter={false}
          disableColumnSelector={false}
          disableDensitySelector={false}
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