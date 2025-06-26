import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { Category, CategoryType } from '../../models/category.model';
import {
  Card,
  CardHeader,
  CardContent
} from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../components/ui2/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '../../components/ui2/table';
import { Badge } from '../../components/ui2/badge';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: 'membership', label: 'Membership Types' },
  { value: 'member_status', label: 'Member Status' },
  { value: 'income_transaction', label: 'Income Categories' },
  { value: 'expense_transaction', label: 'Expense Categories' },
  { value: 'budget', label: 'Budget Categories' },
  { value: 'relationship_type', label: 'Relationship Types' }
];

function CategoryList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CategoryType>('membership');
  const [searchTerm, setSearchTerm] = useState('');

  const { useQuery, useDelete } = useCategoryRepository();
  const { data: result, isLoading } = useQuery({
    filters: { type: { operator: 'eq', value: activeTab } }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage categories for various aspects of your church
          </p>
        </div>
        <Button onClick={() => navigate('add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium">Categories</h3>
            </div>
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
            <TabsList className="mb-4">
              {categoryTypes.map(type => (
                <TabsTrigger key={type.value} value={type.value}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categoryTypes.map(type => (
              <TabsContent key={type.value} value={type.value}>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden md:table-cell">Description</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[120px]">Order</TableHead>
                          <TableHead className="w-[180px]">Account</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map(cat => (
                          <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.code}</TableCell>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{cat.description || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={cat.is_active ? 'success' : 'secondary'}>
                                {cat.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{cat.sort_order}</TableCell>
                            <TableCell>
                              {cat.chart_of_accounts ? `${cat.chart_of_accounts.code} - ${cat.chart_of_accounts.name}` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`${cat.id}`)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`${cat.id}/edit`)} disabled={cat.is_system}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} disabled={cat.is_system}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">No categories found</p>
                    <Button onClick={() => navigate('add')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default CategoryList;
