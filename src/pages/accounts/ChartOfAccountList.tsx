import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChartOfAccountRepository } from '../../hooks/useChartOfAccountRepository';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Badge } from '../../components/ui2/badge';
import { TreeView, TreeItem } from '../../components/ui2/treeview';
import { 
  Plus, 
  Search, 
  FileText, 
  Loader2, 
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { ChartOfAccount } from '../../models/chartOfAccount.model';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui2/select';

function ChartOfAccountList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  // Get accounts
  const { useQuery, useDelete } = useChartOfAccountRepository();
  const { data: result, isLoading } = useQuery();
  const accounts = result?.data || [];
  
  // Delete mutation
  const deleteMutation = useDelete();
  
  // Filter accounts based on search term and type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.description && account.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || account.account_type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Group accounts by type
  const accountsByType = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, ChartOfAccount[]>);
  
  // Sort accounts by code
  Object.keys(accountsByType).forEach(type => {
    accountsByType[type].sort((a, b) => a.code.localeCompare(b.code));
  });
  
  // Build account tree
  const buildAccountTree = (accounts: ChartOfAccount[]) => {
    const accountMap = new Map<string, ChartOfAccount & { children: ChartOfAccount[] }>();
    
    // First pass: create map of all accounts with empty children array
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });
    
    // Second pass: build parent-child relationships
    const rootAccounts: (ChartOfAccount & { children: ChartOfAccount[] })[] = [];
    
    accounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id)!;
      
      if (account.parent_id && accountMap.has(account.parent_id)) {
        // This account has a parent, add it to parent's children
        const parent = accountMap.get(account.parent_id)!;
        parent.children.push(accountWithChildren);
      } else {
        // This is a root account
        rootAccounts.push(accountWithChildren);
      }
    });
    
    return rootAccounts;
  };
  
  // Build tree for each account type
  const accountTrees: Record<string, (ChartOfAccount & { children: ChartOfAccount[] })[]> = {};
  Object.keys(accountsByType).forEach(type => {
    accountTrees[type] = buildAccountTree(accountsByType[type]);
  });
  
  // Handle account deletion
  const handleDeleteAccount = async (id: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(id);
        // Account deleted successfully
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };
  
  // Render account tree
  const renderAccountTree = (account: ChartOfAccount & { children: ChartOfAccount[] }) => {
    const hasChildren = account.children && account.children.length > 0;
    
    return (
      <TreeItem
        key={account.id}
        id={account.id}
        label={
          <div className="flex items-center">
            <span className="font-mono text-xs text-muted-foreground mr-2">{account.code}</span>
            <span>{account.name}</span>
          </div>
        }
        defaultExpanded={false}
        isSelected={selectedAccountId === account.id}
        endContent={
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accounts/chart-of-accounts/${account.id}`);
              }}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/accounts/chart-of-accounts/${account.id}/edit`);
              }}
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAccount(account.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        }
        onClick={() => setSelectedAccountId(account.id)}
      >
        {hasChildren && account.children.map(child => renderAccountTree(child))}
      </TreeItem>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Chart of Accounts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your organization's chart of accounts for financial reporting.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => navigate('/accounts/chart-of-accounts/add')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="liability">Liabilities</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Chart of Accounts</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAccounts.length > 0 ? (
              <div>
                {Object.keys(accountTrees).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(accountTrees).map(([type, accounts]) => (
                      <div key={type} className="border rounded-lg p-4">
                        <h4 className="text-md font-medium mb-4 flex items-center">
                          <Badge variant="secondary" className="capitalize mr-2">
                            {type}
                          </Badge>
                          <span className="capitalize">{type} Accounts</span>
                        </h4>
                        
                        <TreeView 
                          onNodeSelect={(id) => setSelectedAccountId(id)}
                          selectedId={selectedAccountId}
                          className="max-h-[400px] overflow-y-auto pr-2"
                        >
                          {accounts.map(account => renderAccountTree(account))}
                        </TreeView>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No accounts match your search criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No accounts found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || typeFilter !== 'all' 
                    ? "No accounts match your search criteria." 
                    : "You haven't created any accounts yet."}
                </p>
                <Button
                  onClick={() => navigate('/accounts/chart-of-accounts/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ChartOfAccountList;