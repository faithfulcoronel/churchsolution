import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { Member } from '../../models/member.model';
import { SubscriptionGate } from '../../components/SubscriptionGate';
import { DataGrid } from '../../components/ui2/data-grid';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui2/avatar';
import { Input } from '../../components/ui2/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../components/ui2/select';
import { Search } from 'lucide-react';
import { categoryUtils } from '../../utils/categoryUtils';
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleFilterChange = useCallback(
    (f: ColumnFiltersState, g: string) => {
      setColumnFilters(f);
      setSearchTerm(g);
    },
    []
  );

  const { useQuery: useMembersQuery, useDelete } = useMemberRepository();

  const { data: statusCategories } = useReactQuery({
    queryKey: ['categories', 'member_status'],
    queryFn: () => categoryUtils.getCategories('member_status'),
  });

  // ✅ Memoized filters to ensure query triggers properly
  const filters = useMemo(() => {
    const baseFilters = columnFilters.reduce((acc, filter) => {
      return {
        ...acc,
        [filter.id]: { operator: 'contains', value: filter.value }
      };
    }, {} as Record<string, any>);

    if (searchTerm) {
      const escaped = searchTerm.replace(/[*]/g, ''); // remove unsafe wildcard
      baseFilters.or = `first_name.ilike.*${escaped}*,last_name.ilike.*${escaped}*,preferred_name.ilike.*${escaped}*,email.ilike.*${escaped}*`;
    }

    if (statusFilter !== 'all') {
      baseFilters.membership_status_id = { operator: 'eq', value: statusFilter };
    }

    return baseFilters;
  }, [columnFilters, searchTerm, statusFilter]);

  const { data: result, isLoading, error } = useMembersQuery({
    pagination: {
      page: page + 1,
      pageSize,
    },
    order: sorting[0] ? {
      column: sorting[0].id,
      ascending: !sorting[0].desc,
    } : undefined,
    filters,
  });

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

  const columns: ColumnDef<Member>[] = [
    {
      id: 'first_name',
      accessorKey: 'first_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar size="md">
            {row.original.profile_picture_url && (
              <AvatarImage
                src={row.original.profile_picture_url}
                alt={`${row.original.first_name} ${row.original.last_name}`}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <AvatarFallback>
              {row.original.first_name?.charAt(0)}
              {row.original.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2">
            {row.original.first_name} {row.original.last_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'preferred_name',
      header: 'Preferred Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-muted-foreground mr-2" />
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'contact_number',
      header: 'Contact',
      cell: ({ getValue }) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: 'membership_status.name',
      header: 'Status',
      accessorFn: (row) => row.membership_status?.name,
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant={getStatusColor(row.original.membership_status?.code)}>
            {row.original.membership_status?.name}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'membership_date',
      header: 'Member Since',
      cell: ({ getValue }) => {
        const value = getValue<string | null>();
        return (
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            {value ? new Date(value).toLocaleDateString() : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'birthday',
      header: 'Birthday',
      cell: ({ getValue }) => {
        const value = getValue<string | null>();
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
              <Button variant="default" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </Link>
          </SubscriptionGate>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search />}
          />
        </div>

        <div className="relative mt-4 sm:mt-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusCategories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mt-6">
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid<Member>
            data={result?.data || []}
            recordCount={result?.count ?? 0}
            columns={columns}
            loading={isLoading}
            error={error instanceof Error ? error.message : undefined}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortingChange={setSorting}
            onFilterChange={handleFilterChange}
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
            pagination={{ pageSize }}
            storageKey="member-list-grid"
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
