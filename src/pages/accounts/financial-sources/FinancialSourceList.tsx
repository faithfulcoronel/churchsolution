import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinancialSourceRepository } from '../../../hooks/useFinancialSourceRepository';
import { FinancialSource } from '../../../models/financialSource.model';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';
import { Badge } from '../../../components/ui2/badge';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import { Plus, Search, Ban as Bank, Wallet, Globe, Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { GridColDef } from '@mui/x-data-grid';

function FinancialSourceList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();
  
  // Get sources
  const { data: result, isLoading, error } = useSourcesQuery();
  const sources = result?.data || [];
  
  // Filter sources
  const filteredSources = sources.filter((source: FinancialSource) => {
    const matchesSearch = 
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (source.description && source.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (source.account_number && source.account_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || source.source_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && source.is_active) || 
      (statusFilter === 'inactive' && !source.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Bank className="h-5 w-5 text-primary mr-2" />;
      case 'cash':
        return <Wallet className="h-5 w-5 text-success mr-2" />;
      case 'online':
        return <Globe className="h-5 w-5 text-info mr-2" />;
      default:
        return <CreditCard className="h-5 w-5 text-warning mr-2" />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Source Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center">
          {getSourceTypeIcon(params.row.source_type)}
          <span className="font-medium">{params.value}</span>
        </div>
      ),
    },
    {
      field: 'source_type',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Badge 
          variant={
            params.value === 'bank' ? 'primary' : 
            params.value === 'cash' ? 'success' : 
            params.value === 'online' ? 'info' : 'secondary'
          }
          className="capitalize"
        >
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'account_number',
      headerName: 'Account Number',
      flex: 1.5,
      minWidth: 150,
    },
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
      renderCell: (params) => (
        <Badge 
          variant={params.value ? 'success' : 'secondary'}
          className="flex items-center"
        >
          {params.value ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (params: any) => {
    navigate(`/accounts/sources/${params.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Financial Sources</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage financial sources for tracking income and expenses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/accounts/sources/add">
            <Button
              variant="default"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search />}
          />
        </div>

        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-4">
          <div className="relative">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative mt-4 sm:mt-0">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              <DataGrid<FinancialSource>
                columns={columns}
                data={filteredSources}
                totalRows={filteredSources.length}
                loading={isLoading}
                error={error instanceof Error ? error.message : undefined}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                getRowId={(row) => row.id}
                onRowClick={(params) => handleRowClick(params)}
                autoHeight
                paginationMode="client"
                disableColumnMenu={false}
                disableColumnFilter={false}
                disableColumnSelector={false}
                disableDensitySelector={false}
                page={page}
                pageSize={pageSize}
                showQuickFilter={false}
                storageKey="financial-source-list-grid"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FinancialSourceList;