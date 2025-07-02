import React, { useState } from 'react';
import { format } from 'date-fns';
import { DataGrid, GridColDef } from '../../components/ui2/mui-datagrid';
import { Card, CardContent } from '../../components/ui2/card';
import { useActivityLogRepository } from '../../hooks/useActivityLogRepository';
import { ActivityLog } from '../../models/activityLog.model';

function ActivityList() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { useQuery } = useActivityLogRepository();

  const { data: result, isLoading, error } = useQuery({
    order: { column: 'created_at', ascending: false },
    pagination: { page: page + 1, pageSize },
  });

  const logs = result?.data || [];
  const totalRows = result?.count || 0;

  const columns: GridColDef[] = [
    {
      field: 'created_at',
      headerName: 'Date',
      flex: 1,
      minWidth: 180,
      valueFormatter: params =>
        params.value ? format(new Date(params.value as string), 'Pp') : '',
    },
    { field: 'action', headerName: 'Action', flex: 1, minWidth: 120 },
    { field: 'entity_type', headerName: 'Entity', flex: 1, minWidth: 120 },
    {
      field: 'performed_by',
      headerName: 'User',
      flex: 1,
      minWidth: 160,
      valueGetter: params => (params.row.auth_users?.email as string) || '',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Activity</h1>
      <Card>
        <CardContent>
          <DataGrid<ActivityLog>
            columns={columns}
            data={logs}
            totalRows={totalRows}
            loading={isLoading}
            error={error instanceof Error ? error.message : undefined}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            paginationMode="client"
            autoHeight
            getRowId={row => row.id}
            storageKey="activity-list-grid"
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityList;
