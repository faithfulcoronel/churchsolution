import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembershipStatusRepository } from '../../../hooks/useMembershipStatusRepository';
import { MembershipStatus } from '../../../models/membershipStatus.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import type { GridColDef } from '@mui/x-data-grid';
import { Badge } from '../../../components/ui2/badge';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';

function MembershipStatusList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { useQuery, useDelete } = useMembershipStatusRepository();
  const { data: result, isLoading, error } = useQuery();
  const statuses = result?.data || [];
  const deleteMutation = useDelete();

  const filtered = statuses.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this membership status?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting membership status', err);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 1, minWidth: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'is_active',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: params => (
        <Badge variant={params.value ? 'success' : 'secondary'}>
          {params.value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { field: 'sort_order', headerName: 'Order', flex: 1, minWidth: 100, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`${params.row.id}`); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`${params.row.id}/edit`); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleDelete(params.row.id); }} disabled={params.row.is_system}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership Status</h1>
          <p className="text-muted-foreground">Manage membership status options.</p>
        </div>
        <Button onClick={() => navigate('add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Status
        </Button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search status..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length > 0 ? (
              <DataGrid<MembershipStatus>
                columns={columns}
                data={filtered}
                totalRows={filtered.length}
                loading={isLoading}
                error={error instanceof Error ? error.message : undefined}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                getRowId={row => row.id}
                onRowClick={params => navigate(`${params.row.id}`)}
                autoHeight
                paginationMode="client"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No membership status found</p>
                <Button onClick={() => navigate('add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MembershipStatusList;
