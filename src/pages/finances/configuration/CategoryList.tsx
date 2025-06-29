import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryRepository } from '../../../hooks/useCategoryRepository';
import { Category, CategoryType } from '../../../models/category.model';
import { Card, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { DataGrid } from '../../../components/ui2/mui-datagrid';
import type { GridColDef } from '@mui/x-data-grid';
import { Badge } from '../../../components/ui2/badge';
import { Plus, Eye, Edit, Trash2, Loader2, Search } from 'lucide-react';

interface CategoryListProps {
  categoryType: CategoryType;
  title: string;
  description: string;
}

function CategoryList({ categoryType, title, description }: CategoryListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { useQuery, useDelete } = useCategoryRepository();
  const { data: result, isLoading, error } = useQuery({
    filters: { type: { operator: 'eq', value: categoryType } }
  });
  const categories = result?.data || [];
  const deleteMutation = useDelete();

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting category', err);
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
      renderCell: (params) => (
        <Badge variant={params.value ? 'success' : 'secondary'}>
          {params.value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { field: 'sort_order', headerName: 'Order', flex: 1, minWidth: 100, type: 'number' },
    {
      field: 'account',
      headerName: 'Account',
      flex: 2,
      minWidth: 180,
      valueGetter: (params) =>
        params.row.chart_of_accounts
          ? `${params.row.chart_of_accounts.code} - ${params.row.chart_of_accounts.name}`
          : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${params.row.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${params.row.id}/edit`);
            }}
            disabled={params.row.is_system}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
            }}
            disabled={params.row.is_system}
          >
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
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => navigate('add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            ) : filteredCategories.length > 0 ? (
              <DataGrid<Category>
                columns={columns}
                data={filteredCategories}
                totalRows={filteredCategories.length}
                loading={isLoading}
                error={error instanceof Error ? error.message : undefined}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`${params.row.id}`)}
                autoHeight
                paginationMode="client"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No categories found</p>
                <Button onClick={() => navigate('add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
}

export default CategoryList;
