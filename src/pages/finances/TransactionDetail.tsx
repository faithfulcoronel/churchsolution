import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFinancialTransactionHeaderRepository } from '../../hooks/useFinancialTransactionHeaderRepository';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Badge } from '../../components/ui2/badge';
import { Textarea } from '../../components/ui2/textarea';
import { 
  ArrowLeft, 
  FileText, 
  Loader2, 
  Edit, 
  Trash2,
  Check,
  X,
  AlertTriangle,
  DollarSign,
  Calendar,
  Hash,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';
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

function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  
  // State for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Get transaction data
  const { 
    useQuery, 
    useDelete, 
    getTransactionEntries, 
    postTransaction, 
    voidTransaction 
  } = useFinancialTransactionHeaderRepository();
  
  const { data: headerData, isLoading: isHeaderLoading } = useQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    relationships: [
      {
        table: 'financial_sources',
        foreignKey: 'source_id',
        select: ['id', 'name', 'source_type']
      }
    ],
    enabled: !!id
  });
  
  const header = headerData?.data?.[0];
  
  // State for transaction entries
  const [entries, setEntries] = useState<any[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  
  // Load transaction entries
  useEffect(() => {
    const loadEntries = async () => {
      if (id) {
        try {
          setIsEntriesLoading(true);
          const entriesData = await getTransactionEntries(id);
          setEntries(entriesData || []);
        } catch (error) {
          console.error('Error loading transaction entries:', error);
        } finally {
          setIsEntriesLoading(false);
        }
      }
    };
    
    loadEntries();
  }, [id, getTransactionEntries]);
  
  // Delete mutation
  const deleteMutation = useDelete();
  
  // Calculate totals
  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  
  // Handle delete transaction
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setActionInProgress(true);
      setActionError(null);
      
      await deleteMutation.mutateAsync(id);
      navigate('/finances/transactions');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setActionError(error instanceof Error ? error.message : 'An error occurred while deleting the transaction');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle post transaction
  const handlePost = async () => {
    if (!id) return;
    
    try {
      setActionInProgress(true);
      setActionError(null);
      
      await postTransaction(id);
      setShowPostDialog(false);
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error posting transaction:', error);
      setActionError(error instanceof Error ? error.message : 'An error occurred while posting the transaction');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle void transaction
  const handleVoid = async () => {
    if (!id || !voidReason.trim()) return;
    
    try {
      setActionInProgress(true);
      setActionError(null);
      
      await voidTransaction(id, voidReason);
      setShowVoidDialog(false);
      setVoidReason('');
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error voiding transaction:', error);
      setActionError(error instanceof Error ? error.message : 'An error occurred while voiding the transaction');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Export transaction to CSV
  const handleExportCSV = () => {
    if (!entries || entries.length === 0 || !header) return;
    
    // Create CSV content
    const headers = ['Account', 'Description', 'Debit', 'Credit'];
    const rows = entries.map(entry => [
      entry.account?.code + ' - ' + entry.account?.name,
      entry.description,
      entry.debit || '',
      entry.credit || ''
    ]);
    
    // Add totals row
    rows.push(['TOTALS', '', totalDebits, totalCredits]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transaction_${header.transaction_number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isHeaderLoading || isEntriesLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!header) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Transaction not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The transaction you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/finances/transactions')}
          >
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/finances/transactions')}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Transactions
        </Button>
      </div>
      
      {/* Transaction Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-foreground">{header.transaction_number}</h2>
                  <Badge 
                    variant={
                      header.status === 'posted' ? 'success' : 
                      header.status === 'voided' ? 'destructive' : 
                      'secondary'
                    }
                    className="ml-3 capitalize"
                  >
                    {header.status === 'posted' ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Posted
                      </>
                    ) : header.status === 'voided' ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Voided
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(new Date(header.transaction_date), 'MMMM d, yyyy')}</span>
                  {header.reference && (
                    <>
                      <span className="mx-2">•</span>
                      <Hash className="h-4 w-4 mr-1" />
                      <span>Ref: {header.reference}</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{header.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {header.status === 'draft' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/finances/transactions/${id}/edit`)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPostDialog(true)}
                    className="flex items-center"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              
              {header.status === 'posted' && (
                <Button
                  variant="outline"
                  onClick={() => setShowVoidDialog(true)}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Void
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction Details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Transaction Details</h3>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Account</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Debit</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Credit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-4 py-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{entry.account?.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{entry.account?.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{entry.description}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {entry.debit ? formatCurrency(entry.debit, currency) : ''}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {entry.credit ? formatCurrency(entry.credit, currency) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-medium">
                  <td className="px-4 py-2" colSpan={2}>
                    Totals
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(totalDebits, currency)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(totalCredits, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2" colSpan={2}>
                    Difference
                  </td>
                  <td className="px-4 py-2 text-right" colSpan={2}>
                    <span className={isBalanced ? 'text-success' : 'text-destructive'}>
                      {isBalanced 
                        ? 'Balanced' 
                        : formatCurrency(Math.abs(totalDebits - totalCredits), currency)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Additional Information</h3>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Transaction Details</h4>
              <dl className="divide-y divide-border">
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Transaction Number</dt>
                  <dd className="text-sm text-foreground col-span-2">{header.transaction_number}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Transaction Date</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {format(new Date(header.transaction_date), 'MMMM d, yyyy')}
                  </dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="text-sm text-foreground col-span-2">{header.description}</dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Reference</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {header.reference || 'None'}
                  </dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Financial Source</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {header.source ? (
                      <div className="flex items-center">
                        <span>{header.source.name}</span>
                        <Badge variant="secondary" className="ml-2 capitalize">
                          {header.source.source_type}
                        </Badge>
                      </div>
                    ) : (
                      'None'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Status Information</h4>
              <dl className="divide-y divide-border">
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    <Badge 
                      variant={
                        header.status === 'posted' ? 'success' : 
                        header.status === 'voided' ? 'destructive' : 
                        'secondary'
                      }
                      className="capitalize"
                    >
                      {header.status}
                    </Badge>
                  </dd>
                </div>
                
                {header.status === 'posted' && header.posted_at && (
                  <>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Posted Date</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        {format(new Date(header.posted_at), 'MMMM d, yyyy h:mm a')}
                      </dd>
                    </div>
                  </>
                )}
                
                {header.status === 'voided' && header.voided_at && (
                  <>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Voided Date</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        {format(new Date(header.voided_at), 'MMMM d, yyyy h:mm a')}
                      </dd>
                    </div>
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Void Reason</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        {header.void_reason}
                      </dd>
                    </div>
                  </>
                )}
                
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {format(new Date(header.created_at), 'MMMM d, yyyy h:mm a')}
                  </dd>
                </div>
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-sm text-foreground col-span-2">
                    {format(new Date(header.updated_at), 'MMMM d, yyyy h:mm a')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="danger">
              Delete Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowDeleteDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Post Confirmation Dialog */}
      <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="success">
              Post Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post this transaction? Once posted, it cannot be edited or deleted.
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowPostDialog(false);
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="default"
              onClick={handlePost}
              disabled={actionInProgress}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Void Confirmation Dialog */}
      <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle variant="warning">
              Void Transaction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void this transaction? This will reverse its financial effects.
              {actionError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-2">
            <Textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Enter reason for voiding this transaction"
              required
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setShowVoidDialog(false);
                setVoidReason('');
                setActionError(null);
              }}
              disabled={actionInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleVoid}
              disabled={actionInProgress || !voidReason.trim()}
            >
              {actionInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Voiding...
                </>
              ) : (
                'Void Transaction'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TransactionDetail;