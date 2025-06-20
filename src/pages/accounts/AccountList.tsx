import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { Account } from '../../models/account.model';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui2/select';
import { Badge } from '../../components/ui2/badge';
import { DataGrid } from '../../components/ui2/mui-datagrid';
import {
  Plus,
  Search,
  Building2,
  User,
  Loader2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { GridColDef } from '@mui/x-data-grid';

function AccountList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const { useQuery: useAccountsQuery } = useAccountRepository();
  
  // Get accounts
  const { data: result, isLoading } = useAccountsQuery();
  const accounts = result?.data || [];
  
  // Filter accounts
  const filteredAccounts = accounts.filter((account: Account) => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.description && account.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.account_number && account.account_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || account.account_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && account.is_active) || 
      (statusFilter === 'inactive' && !account.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Account Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center">
          {params.row.account_type === 'organization' ? (
            <Building2 className="h-5 w-5 text-primary mr-2" />
          ) : (
            <User className="h-5 w-5 text-success mr-2" />
          )}
          <span className="font-medium">{params.value}</span>
        </div>
      ),
    },
    {
      field: 'account_number',
      headerName: 'Account Number',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'account_type',
      headerName: 'Type',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Badge 
          variant={params.value === 'organization' ? 'primary' : 'success'}
          className="capitalize"
        >
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        params.value ? (
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{params.value}</span>
          </div>
        ) : null
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        params.value ? (
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{params.value}</span>
          </div>
        ) : null
      ),
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
    navigate(`/accounts/${params.id}`);
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
          <h1 className="text-2xl font-semibold text-foreground">Accounts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage organization and personal accounts for financial tracking.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link to="/accounts/add">
            <Button
              variant="default"
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Input
            placeholder="Search accounts..."
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
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="person">Person</SelectItem>
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
              <DataGrid
                columns={columns}
                data={filteredAccounts}
                totalRows={filteredAccounts.length}
                loading={isLoading}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                getRowId={(row) => row.id}
                onRowClick={(params) => handleRowClick(params)}
                autoHeight
                disableColumnMenu={false}
                disableColumnFilter={false}
                disableColumnSelector={false}
                disableDensitySelector={false}
                page={page}
                pageSize={pageSize}
                slots={{
                  toolbar: () => (
                    <div className="flex justify-between items-center p-4">
                      <h3 className="text-lg font-semibold">Accounts</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/accounts/add')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </div>
                  ),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AccountList;