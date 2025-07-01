import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GridColDef, GridValueGetterParams, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { Member } from '../../models/member.model';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Input } from '../../components/ui2/input';
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
  Search,
} from 'lucide-react';
import { Card } from '../../components/ui2/card';

function MemberList() {
  const navigate = useNavigate();
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Use the member repository hook
  const { useQuery, useDelete } = useMemberRepository();

  // Get members with repository
  const filters = filterModel.items?.reduce((acc, filter) => ({
    ...acc,
    [filter.field]: {
      operator: filter.operator.toLowerCase(),
      value: filter.value
    }
  }), {} as Record<string, any>) || {};

  if (searchTerm) {
    filters.or = [
      { field: 'first_name', operator: 'contains', value: searchTerm },
      { field: 'last_name', operator: 'contains', value: searchTerm },
      { field: 'preferred_name', operator: 'contains', value: searchTerm },
      { field: 'email', operator: 'contains', value: searchTerm },
    ];
  }

  const { data: result, isLoading, error } = useQuery({
    pagination: {
      page: page + 1, // MUI Data Grid uses 0-based pages
      pageSize,
    },
    order: sortModel[0] ? {
      column: sortModel[0].field,
      ascending: sortModel[0].sort === 'asc'
    } : undefined,
    filters,
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
      field: 'first_name',
      headerName: 'First Name',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'preferred_name',
      headerName: 'Preferred Name',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value}
        </div>
      ),
    },
    {
      field: 'contact_number',
      headerName: 'Contact',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value}
        </div>
      ),
    },
    {
      field: 'membership_status.name',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="space-y-1">
          <Badge variant={getStatusColor(params.row.membership_status?.code)}>
            {params.row.membership_status?.name}
          </Badge>
        </div>
      ),
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.membership_status?.name}`,
    },
    {
      field: 'membership_date',
      headerName: 'Member Since',
      flex: 1,
      minWidth: 120,
      valueGetter: (params: GridValueGetterParams) => 
        params.value ? new Date(params.value) : null,
      renderCell: (params) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value ? new Date(params.value).toLocaleDateString() : ''}
        </div>
      ),
    },
    {
      field: 'birthday',
      headerName: 'Birthday',
      flex: 1,
      minWidth: 120,
      valueGetter: (params: GridValueGetterParams) => 
        params.value ? new Date(params.value) : null,
      renderCell: (params) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
          {params.value ? new Date(params.value).toLocaleDateString() : ''}
        </div>
      ),
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
              navigate(`/members/${params.row.id}/edit`);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingMemberId(params.row.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
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

      <div className="mt-6 w-full sm:max-w-xs">
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <Card className="mt-6">
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid<Member>
            data={result?.data || []}
            columns={columns}
            totalRows={result?.count || 0}
            loading={isLoading}
            error={error instanceof Error ? error.message : undefined}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={setSortModel}
            onFilterChange={setFilterModel}
            onRowClick={(params) => navigate(`/members/${params.row.id}`)}
            page={page}
            pageSize={pageSize}
            disableRowSelectionOnClick
            slotProps={{ toolbar: { showQuickFilter: false } }}
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