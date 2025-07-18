import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useFinancialSourceService } from '../../../hooks/useFinancialSourceService';
import { useSourceRecentTransactionRepository } from '../../../hooks/useSourceRecentTransactionRepository';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Badge } from '../../../components/ui2/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui2/alert-dialog';
import { Ban as Bank, Wallet, Globe, CreditCard, FileText, Pencil, Trash2, Loader2, CheckCircle2, XCircle, Hash, DollarSign, AlertTriangle } from 'lucide-react';

// Maximum number of retries for delete operation
const MAX_RETRIES = 3;
// Initial delay in milliseconds (1 second)
const INITIAL_DELAY = 1000;

function FinancialSourceProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { useQuery: useSourceQuery, useDelete } = useFinancialSourceService();
  const { useRecentTransactions, useSourceBalance } = useSourceRecentTransactionRepository();
  const { currency } = useCurrencyStore();
  
  // Fetch source data
  const { data: sourceData, isLoading } = useSourceQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    enabled: !!id
  });
  
  const source = sourceData?.data?.[0];
  
  // Fetch recent transactions aggregated by header for this source
  const accountId = source?.account_id;

  const { data: transactionsData, isLoading: transactionsLoading } =
    useRecentTransactions(accountId || '');

  const { data: sourceBalance, isLoading: balanceLoading } =
    useSourceBalance(accountId || '');
  
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
          navigate('/accounts/sources');
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
      console.error('Error deleting financial source:', error);
      setDeleteError('Failed to delete financial source after multiple attempts. Please check your internet connection or try again later.');
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
  
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Bank className="h-8 w-8 text-primary" />;
      case 'cash':
        return <Wallet className="h-8 w-8 text-success" />;
      case 'online':
        return <Globe className="h-8 w-8 text-info" />;
      default:
        return <CreditCard className="h-8 w-8 text-warning" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!source) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Financial Source Not Found</h3>
          <p className="text-muted-foreground mb-6">The financial source you're looking for doesn't exist or has been removed.</p>
          <BackButton fallbackPath="/accounts/sources" label="Go Back to Financial Sources" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/accounts/sources" label="Back to Financial Sources" />
      </div>
      
      {/* Source Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                {getSourceTypeIcon(source.source_type)}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-foreground">{source.name}</h2>
                  <Badge 
                    variant={source.is_active ? 'success' : 'secondary'}
                    className="ml-3"
                  >
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {source.account_number && (
                  <div className="flex items-center mt-1 text-muted-foreground">
                    <Hash className="h-4 w-4 mr-1" />
                    <span>{source.account_number}</span>
                  </div>
                )}
                {source.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{source.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/accounts/sources/${id}/edit`)}
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
      
      {/* Source Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Source Information
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="divide-y divide-border">
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Source Type</dt>
                <dd className="text-sm text-foreground col-span-2 capitalize">
                  <Badge 
                    variant={
                      source.source_type === 'bank' ? 'primary' : 
                      source.source_type === 'cash' ? 'success' : 
                      source.source_type === 'online' ? 'info' : 'secondary'
                    }
                    className="capitalize"
                  >
                    {source.source_type}
                  </Badge>
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Account Number</dt>
                <dd className="text-sm text-foreground col-span-2">
                  {source.account_number || 'Not specified'}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm text-foreground col-span-2">
                  <Badge 
                    variant={source.is_active ? 'success' : 'secondary'}
                    className="flex items-center w-fit"
                  >
                    {source.is_active ? (
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
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm text-foreground col-span-2">
                  {new Date(source.created_at).toLocaleDateString()} at {new Date(source.created_at).toLocaleTimeString()}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm text-foreground col-span-2">
                  {new Date(source.updated_at).toLocaleDateString()} at {new Date(source.updated_at).toLocaleTimeString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Source Balance */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-medium">Source Balance</h3>
            </div>
          </CardHeader>

          <CardContent>
            {balanceLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(Math.abs(sourceBalance || 0), currency)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="md:col-span-3">
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
                      <tr key={transaction.header_id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={transaction.amount >= 0 ? 'success' : 'destructive'}
                          >
                            {transaction.amount >= 0 ? 'income' : 'expense'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {transaction.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={transaction.amount >= 0 ? 'text-success' : 'text-destructive'}>
                            {transaction.amount >= 0 ? '+' : '-'}
                            {Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found for this source.</p>
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
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Financial Source
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this financial source? This action cannot be undone.
              {transactionsData && transactionsData.length > 0 && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md text-warning flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    This source has {transactionsData.length} associated transactions. 
                    Deleting this source may affect financial records.
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
                'Delete Source'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FinancialSourceProfile;