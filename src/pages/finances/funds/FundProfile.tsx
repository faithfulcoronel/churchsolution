import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Badge } from '../../../components/ui2/badge';
import { Tabs } from '../../../components/ui2/tabs';
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
import {
  DollarSign,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

function FundProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { useQuery: useFundQuery, useDelete } = useFundRepository();

  const { data: fundData, isLoading } = useFundQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: !!id,
  });

  const fund = fundData?.data?.[0];

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['fund-transactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          id,
          type,
          debit,
          credit,
          date,
          description,
          category:category_id (name)
        `)
        .eq('fund_id', id)
        .order('date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const deleteMutation = useDelete();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleteInProgress(true);
      setDeleteError(null);
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          await deleteMutation.mutateAsync(id);
          navigate('/finances/funds');
          return;
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            throw error;
          }
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          setRetryCount(attempt + 1);
          setDeleteError(`Network error. Retrying in ${delay/1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
        }
      }
    } catch (error) {
      console.error('Error deleting fund:', error);
      setDeleteError('Failed to delete fund after multiple attempts. Please check your internet connection or try again later.');
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

  if (!fund) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Fund Not Found</h3>
          <BackButton fallbackPath="/finances/funds" label="Go Back to Funds" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/funds" label="Back to Funds" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                {fund.name}
                <Badge variant={fund.type === 'restricted' ? 'destructive' : 'secondary'} className="ml-3 capitalize">
                  {fund.type}
                </Badge>
              </h2>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate(`/finances/funds/${id}/edit`)} className="flex items-center">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Tabs
          tabs={[
            { id: 'details', label: 'Fund Details', icon: <DollarSign className="h-5 w-5" /> },
            { id: 'transactions', label: 'Transactions', icon: <DollarSign className="h-5 w-5" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          size="sm"
        />
      </div>

      <div className="space-y-6">
        {activeTab === 'details' && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Fund Details
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="divide-y divide-border">
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Code</dt>
                  <dd className="text-sm text-foreground col-span-2">{fund.code}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-sm text-foreground col-span-2">{fund.name}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="text-sm text-foreground col-span-2 capitalize">{fund.type}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="text-sm text-foreground col-span-2">{fund.description || 'No description provided'}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {new Date(fund.created_at).toLocaleDateString()} at {new Date(fund.created_at).toLocaleTimeString()}
                  </dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {new Date(fund.updated_at).toLocaleDateString()} at {new Date(fund.updated_at).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Recent Transactions
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/finances/transactions')}>View All Transactions</Button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {transactionsData.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {transaction.category?.name || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{transaction.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={transaction.type === 'income' ? 'text-success' : 'text-destructive'}>
                              {transaction.type === 'income' ? '+' : '-'}${(transaction.debit - transaction.credit).toFixed(2)}
                          </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found for this fund.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/finances/transactions/add')}>
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">Delete Fund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fund? This action cannot be undone.
              {transactionsData && transactionsData.length > 0 && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md text-warning flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    This fund has {transactionsData.length} associated transactions.
                    Deleting this fund may affect financial records.
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
            <AlertDialogCancel onClick={handleCancelDelete} disabled={deleteInProgress}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleteInProgress}>
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})...` : 'Deleting...'}
                </>
              ) : (
                'Delete Fund'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FundProfile;
