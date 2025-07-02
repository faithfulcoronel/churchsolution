import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts';
import { useAccountingReports } from '../../hooks/useAccountingReports';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import BackButton from '../../components/BackButton';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { Badge } from '../../components/ui2/badge';
import { 
  FileText,
  Calendar, 
  Loader2, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Clock,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';

function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrencyStore();
  
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
    to: new Date(),
  });
  
  // Get account details
  const { useAccount } = useChartOfAccounts();
  const { data: account, isLoading: isLoadingAccount } = useAccount(id || '');
  
  // Get account balance
  const { useAccountBalance, useAccountTransactions } = useAccountingReports();
  const { data: balance, isLoading: isLoadingBalance } = useAccountBalance(
    id || '',
    format(dateRange.to, 'yyyy-MM-dd')
  );
  
  // Get account transactions
  const { data: transactions, isLoading: isLoadingTransactions } =
    useAccountTransactions(
      id || '',
      format(dateRange.from, 'yyyy-MM-dd'),
      format(dateRange.to, 'yyyy-MM-dd')
    );
  
  // Export transactions
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) return;
    
    // Create CSV content
    const headers = ['Date', 'Transaction #', 'Description', 'Debit', 'Credit', 'Status'];
    const rows = transactions.map(tx => [
      format(parse(tx.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd'),
      tx.header?.transaction_number || '',
      tx.description,
      tx.debit || '',
      tx.credit || '',
      tx.header?.status || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `account_${account?.code}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoadingAccount) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!account) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Account not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The account you're looking for doesn't exist or has been deleted.
          </p>
          <BackButton
            fallbackPath="/finances/chart-of-accounts"
            label="Back to Chart of Accounts"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/chart-of-accounts" label="Back to Chart of Accounts" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Account Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Account Details</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h4>
                <dl className="divide-y divide-border">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Code</dt>
                    <dd className="text-sm font-mono text-foreground col-span-2">{account.code}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Name</dt>
                    <dd className="text-sm text-foreground col-span-2">{account.name}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                    <dd className="text-sm text-foreground col-span-2 capitalize">
                      <Badge variant="secondary" className="capitalize">
                        {account.account_type}
                      </Badge>
                    </dd>
                  </div>
                  {account.account_subtype && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Subtype</dt>
                      <dd className="text-sm text-foreground col-span-2 capitalize">
                        {account.account_subtype}
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {account.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Information</h4>
                <dl className="divide-y divide-border">
                  {account.parent && (
                    <div className="py-3 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-muted-foreground">Parent Account</dt>
                      <dd className="text-sm text-foreground col-span-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => navigate(`/finances/chart-of-accounts/${account.parent.id}`)}
                        >
                          {account.parent.code} - {account.parent.name}
                        </Button>
                      </dd>
                    </div>
                  )}
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="text-sm text-foreground col-span-2">
                      {account.description || 'No description provided'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Account Balance</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Balance as of {format(dateRange.to, 'MMMM d, yyyy')}
                </p>
                <div className="flex items-center justify-center mb-4">
                  {balance > 0 ? (
                    <ArrowUp className="h-6 w-6 text-success mr-2" />
                  ) : balance < 0 ? (
                    <ArrowDown className="h-6 w-6 text-destructive mr-2" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-muted-foreground mr-2" />
                  )}
                  <span className={`text-2xl font-bold ${
                    balance > 0 ? 'text-success' : 
                    balance < 0 ? 'text-destructive' : 
                    'text-foreground'
                  }`}>
                    {formatCurrency(Math.abs(balance || 0), currency)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {account.account_type === 'asset' || account.account_type === 'expense' ? (
                    <p>Debit balance (increases with debits)</p>
                  ) : (
                    <p>Credit balance (increases with credits)</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Account Transactions</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePickerField
              value={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onChange={(range) => {
                if (range.from && range.to) {
                  setDateRange({
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              label="Date Range"
              icon={<Calendar className="h-4 w-4" />}
            />
            
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!transactions || transactions.length === 0}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Transaction #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {format(parse(transaction.date, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {transaction.header?.transaction_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {transaction.debit ? formatCurrency(transaction.debit, currency) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {transaction.credit ? formatCurrency(transaction.credit, currency) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {transaction.header?.status === 'posted' ? (
                          <Badge variant="success">Posted</Badge>
                        ) : transaction.header?.status === 'voided' ? (
                          <Badge variant="destructive">Voided</Badge>
                        ) : transaction.header?.status === 'approved' ? (
                          <Badge variant="warning">Approved</Badge>
                        ) : transaction.header?.status === 'submitted' ? (
                          <Badge variant="info">Submitted</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found for this account in the selected date range.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountDetail;