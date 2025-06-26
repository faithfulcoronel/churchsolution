import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { Fund } from '../../../models/fund.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import { Badge } from '../../../components/ui2/badge';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { GridColDef } from '@mui/x-data-grid';
import { Plus, Search, Loader2 } from 'lucide-react';

function FundList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { useQuery: useFundsQuery } = useFundRepository();

  const { data: result, isLoading } = useFundsQuery({
    pagination: { page: page + 1, pageSize },
  });
  const funds = result?.data || [];

  const filteredFunds = funds.filter((fund: Fund) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      fund.name.toLowerCase().includes(search) ||
      (fund.description ? fund.description.toLowerCase().includes(search) : false);
    const matchesType = typeFilter === 'all' || fund.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Fund Name',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 3,
      minWidth: 250,
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Badge variant={params.value === 'restricted' ? 'destructive' : 'secondary'} className="capitalize">
          {params.value}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (params: any) => {
    navigate(`/finances/funds/${params.id}`);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Funds</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage designated and unrestricted funds.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/finances/funds/add">
            <Button variant="default" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Fund
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Input
            placeholder="Search funds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search />}
          />
        </div>

        <div className="mt-4 sm:mt-0">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="unrestricted">Unrestricted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataGrid
                columns={columns}
                data={filteredFunds}
                totalRows={filteredFunds.length}
                loading={isLoading}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onRowClick={handleRowClick}
                autoHeight
                disableColumnMenu={false}
                disableColumnFilter={false}
                disableColumnSelector={false}
                disableDensitySelector={false}
                getRowId={(row) => row.id}
                page={page}
                pageSize={pageSize}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FundList;
