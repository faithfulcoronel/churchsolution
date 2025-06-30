import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePermissionRepository } from '../../../hooks/usePermissionRepository';
import { Permission } from '../../../models/permission.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import type { GridColDef } from '@mui/x-data-grid';
import { Plus, Search, Loader2 } from 'lucide-react';

function PermissionList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { useQuery } = usePermissionRepository();
  const { data: result, isLoading, error } = useQuery({
    pagination: { page: page + 1, pageSize },
    filters: searchTerm
      ? {
          or: [
            { field: 'code', operator: 'ilike', value: `%${searchTerm}%` },
            { field: 'name', operator: 'ilike', value: `%${searchTerm}%` },
            { field: 'module', operator: 'ilike', value: `%${searchTerm}%` },
          ],
        }
      : {},
    order: { column: 'module' },
  });

  const permissions = (result?.data as Permission[]) || [];
  const totalCount = result?.count;

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', flex: 1, minWidth: 150 },
    { field: 'name', headerName: 'Name', flex: 2, minWidth: 200 },
    { field: 'module', headerName: 'Module', flex: 1, minWidth: 150 },
  ];

  const handleRowClick = (params: any) => {
    navigate(`${params.id}`);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Permissions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage application permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="add">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Permission
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 max-w-xs">
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search />}
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataGrid<Permission>
                columns={columns}
                data={permissions}
                totalRows={totalCount ?? 0}
                loading={isLoading}
                error={error instanceof Error ? error.message : undefined}
                onRowClick={handleRowClick}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                autoHeight
                getRowId={(row) => row.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PermissionList;
