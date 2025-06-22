import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Tabs } from '../../components/ui2/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui2/alert-dialog';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Hash,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';

// Maximum number of retries for delete operation
const MAX_RETRIES = 3;
// Initial delay in milliseconds (1 second)
const INITIAL_DELAY = 1000;

function AccountProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { useQuery: useAccountQuery, useDelete } = useAccountRepository();
  
  // Fetch account data
  const { data: accountData, isLoading } = useAccountQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    relationships: [
      {
        table: 'members',
        foreignKey: 'member_id',
        select: ['id', 'first_name', 'last_name', 'email', 'contact_number']
      }
    ],
    enabled: !!id
  });
  
  const account = accountData?.data?.[0];
  
  // Fetch financial transactions for this account
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['account-transactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          id,
          type,
          amount,
          date,
          description,
          category:category_id (name),
          fund:fund_id (name, code)
        `)
        .eq('account_id', id)
        .order('date', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  
  // Delete mutation
  const deleteMutation = useDelete();
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleteInProgress(true);
      setDeleteError(null);
      
      // Attempt to delete with retries
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          await deleteMutation.mutateAsync(id);
          // If successful, navigate away
          navigate('/accounts');
          return;
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            throw error; // Let the outer catch handle the final error
          }
          
          // Calculate exponential backoff delay
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          setRetryCount(attempt + 1);
          setDeleteError(`Network error. Retrying in ${delay/1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          
          // Wait before retrying
          await sleep(delay);
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account after multiple attempts. Please check your internet connection or try again later.');
    } finally {
      setDeleteInProgress(false);
      setRetryCount(0);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeleteError(null);
    setRetryCount(0);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!account) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Account Not Found</h3>
          <p className="text-muted-foreground mb-6">The account you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/accounts')}>
            Go Back to Accounts
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/accounts')}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Accounts
        </Button>
      </div>
      
      {/* Account Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                {account.account_type === 'organization' ? (
                  <Building2 className="h-8 w-8 text-primary" />
                ) : (
                  <User className="h-8 w-8 text-success" />
                )}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-foreground">{account.name}</h2>
                  <Badge 
                    variant={account.is_active ? 'success' : 'secondary'}
                    className="ml-3"
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Hash className="h-4 w-4 mr-1" />
                  <span>{account.account_number || 'No account number'}</span>
                </div>
                {account.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{account.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/accounts/${id}/edit`)}
                className="flex items-center"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={[
            {
              id: 'details',
              label: 'Account Details',
              icon: <FileText className="h-5 w-5" />,
            },
            {
              id: 'transactions',
              label: 'Transactions',
              icon: <DollarSign className="h-5 w-5" />,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          size="sm"
        />
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Basic Information
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="divide-y divide-border">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                    <dd className="text-sm text-foreground col-span-2 capitalize">
                      {account.account_type}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Number</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {account.account_number || 'Not specified'}
                    </dd>
                  </div>
                  {account.tax_id && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Tax ID / EIN</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        {account.tax_id}
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      <Badge 
                        variant={account.is_active ? 'success' : 'secondary'}
                        className="flex items-center w-fit"
                      >
                        {account.is_active ? (
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
                    </dd>
                  </div>
                  {account.account_type === 'person' && account.member && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Linked Member</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <Link 
                          to={`/members/${account.member_id}`}
                          className="text-primary hover:underline flex items-center"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {account.member.first_name} {account.member.last_name}
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Contact Information
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="divide-y divide-border">
                  {account.email && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <a href={`mailto:${account.email}`} className="text-primary hover:underline">
                          {account.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {account.phone && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <a href={`tel:${account.phone}`} className="text-primary hover:underline">
                          {account.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {account.website && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <a 
                          href={account.website.startsWith('http') ? account.website : `https://${account.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {account.website}
                        </a>
                      </dd>
                    </div>
                  )}
                  {account.address && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                      <dd className="text-sm text-foreground col-span-2 whitespace-pre-line">
                        {account.address}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
            
            {/* Notes */}
            {account.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <h3 className="text-lg font-medium flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Notes
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted/20 p-4 rounded-md whitespace-pre-line">
                    {account.notes}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Recent Transactions
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/finances/transactions')}
                >
                  View All Transactions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactionsData && transactionsData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {transactionsData.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={transaction.type === 'income' ? 'success' : 'destructive'}
                            >
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {transaction.category?.name || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}>
                              {transaction.type === 'income' ? '+' : '-'}
                              ${transaction.amount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found for this account.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/finances/transactions/add')}
                  >
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              {transactionsData && transactionsData.length > 0 && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md text-warning flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    This account has {transactionsData.length} associated transactions. 
                    Deleting this account may affect financial records.
                  </span>
                </div>
              )}
              {deleteError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelDelete}
              disabled={deleteInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})...` : 'Deleting...'}
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AccountProfile;