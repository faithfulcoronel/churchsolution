import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { GridColDef, GridSortModel, GridFilterModel } from '@reui/data-grid';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { Member } from '../../models/member.model';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { DataGrid } from '../../components/ui2/data-grid';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui2/alert-dialog';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui2/card';

function MemberList() {
  const navigate = useNavigate();
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<GridSortModel>([]);
  const [filters, setFilters] = useState<GridFilterModel>({ items: [] });

  // Use the member repository hook
  const { useQuery, useDelete } = useMemberRepository();

  // Get members with repository
  const filterParams = filters.items.reduce((acc, item) => {
    if (!item.value) return acc;
    return {
      ...acc,
      [item.field]: { operator: 'contains', value: item.value },
    };
  }, {} as Record<string, any>);

  if (filters.quickFilterValues?.[0]) {
    const q = filters.quickFilterValues[0];
    filterParams.or = [
      { field: 'first_name', operator: 'contains', value: q },
      { field: 'last_name', operator: 'contains', value: q },
      { field: 'preferred_name', operator: 'contains', value: q },
      { field: 'email', operator: 'contains', value: q },
    ];
  }

  const { data: result, isLoading, error } = useQuery({
    pagination: {
      page: page + 1, // Data grid uses 0-based pages
      pageSize,
    },
    order: sorting[0]
      ? { column: sorting[0].field, ascending: sorting[0].sort !== 'desc' }
      : undefined,
    filters: filterParams,
  });

  // Delete member mutation
  const deleteMemberMutation = useDelete();

  const getStatusColor = (statusCode: string) => {
    const statusColors: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      under_discipline: 'destructive',
      regular_attender: 'info',
      visitor: 'warning',
      withdrawn: 'warning',
      removed: 'destructive',
      donor: 'primary'
    };

    return statusColors[statusCode] || 'secondary';
  };

  const columns: GridColDef[] = [
    {
      field: 'profile_picture_url',
      headerName: '',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar size="md">
          {params.row.profile_picture_url ? (
            <AvatarImage
              src={params.row.profile_picture_url}
              alt={`${params.row.first_name} ${params.row.last_name}`}
            />
          ) : (
            <AvatarFallback>
              {params.row.first_name?.charAt(0)}
              {params.row.last_name?.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      ),
    },
    {
      field: 'first_name',
      headerName: 'First Name',
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
    },
    {
      field: 'preferred_name',
      headerName: 'Preferred Name',
    },
    {
      field: 'email',
      headerName: 'Email',
      renderCell: (params) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value as string}
        </div>
      ),
    },
    {
      field: 'contact_number',
      headerName: 'Contact',
      renderCell: (params) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value as string}
        </div>
      ),
    },
    {
      field: 'membership_status',
      headerName: 'Status',
      valueGetter: (params) => params.row.membership_status?.name,
      renderCell: (params) => (
        <div className="space-y-1">
          <Badge variant={getStatusColor(params.row.membership_status?.code)}>
            {params.row.membership_status?.name}
          </Badge>
        </div>
      ),
    },
    {
      field: 'membership_date',
      headerName: 'Member Since',
      renderCell: (params) => {
        const value = params.value as string | null;
        return (
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            {value ? new Date(value).toLocaleDateString() : ''}
          </div>
        );
      },
    },
    {
      field: 'birthday',
      headerName: 'Birthday',
      renderCell: (params) => {
        const value = params.value as string | null;
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            {value ? new Date(value).toLocaleDateString() : ''}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Members</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all church members including their contact information and membership status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <SubscriptionGate type="member">
            <Link to="/members/add">
              <Button
                variant="default"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </Link>
          </SubscriptionGate>
        </div>
      </div>


      <Card className="mt-6">
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid<Member>
            data={result?.data || []}
            columns={columns}
            loading={isLoading}
            error={error instanceof Error ? error.message : undefined}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortingModel={sorting}
            onSortingModelChange={setSorting}
            filterModel={filters}
            onFilterModelChange={setFilters}
            onRowClick={(row) => navigate(`/members/${row.id}`)}
            rowActions={(row) => (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/members/${row.id}/edit`);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingMemberId(row.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
            quickFilterPlaceholder="Search members..."
          />
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMemberId} onOpenChange={() => setDeletingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingMemberId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deletingMemberId) {
                  await deleteMemberMutation.mutateAsync(deletingMemberId);
                  setDeletingMemberId(null);
                }
              }}
            >
              {deleteMemberMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MemberList;
