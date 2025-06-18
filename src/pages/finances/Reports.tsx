import React, { useState } from 'react';
import { useAccountingReports } from '../../hooks/useAccountingReports';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Tabs } from '../../components/ui2/tabs';
import { DatePickerInput } from '../../components/ui2/date-picker';
import { DateRangePickerField } from '../../components/ui2/date-range-picker-field';
import { format } from 'date-fns';
import { 
  FileText, 
  BarChart, 
  DollarSign, 
  Calendar, 
  Loader2, 
  Download, 
  Printer,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';

function Reports() {
  const { currency } = useCurrencyStore();
  const [activeTab, setActiveTab] = useState('trial-balance');
  
  // Date states
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
    to: new Date(),
  });
  
  const { 
    useTrialBalance, 
    useIncomeStatement, 
    useBalanceSheet 
  } = useAccountingReports();
  
  // Fetch reports based on active tab
  const { 
    data: trialBalanceData, 
    isLoading: isLoadingTrialBalance 
  } = useTrialBalance(format(asOfDate, 'yyyy-MM-dd'));
  
  const { 
    data: incomeStatementData, 
    isLoading: isLoadingIncomeStatement 
  } = useIncomeStatement(
    format(dateRange.from, 'yyyy-MM-dd'),
    format(dateRange.to, 'yyyy-MM-dd')
  );
  
  const { 
    data: balanceSheetData, 
    isLoading: isLoadingBalanceSheet 
  } = useBalanceSheet(format(asOfDate, 'yyyy-MM-dd'));
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle export to PDF
  const handleExportPDF = () => {
    // Implement PDF export logic
    alert('PDF export functionality will be implemented here');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-foreground">Financial Reports</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate and view financial reports for your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: 'trial-balance',
              label: 'Trial Balance',
              icon: <FileText className="h-5 w-5" />,
            },
            {
              id: 'income-statement',
              label: 'Income Statement',
              icon: <BarChart className="h-5 w-5" />,
            },
            {
              id: 'balance-sheet',
              label: 'Balance Sheet',
              icon: <DollarSign className="h-5 w-5" />,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          size="sm"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium">
              {activeTab === 'trial-balance' && 'Trial Balance'}
              {activeTab === 'income-statement' && 'Income Statement'}
              {activeTab === 'balance-sheet' && 'Balance Sheet'}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {activeTab === 'income-statement' ? (
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
              ) : (
                <DatePickerInput
                  value={asOfDate}
                  onChange={(date) => date && setAsOfDate(date)}
                  label="As of Date"
                  icon={<Calendar className="h-4 w-4" />}
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Trial Balance */}
            {activeTab === 'trial-balance' && (
              isLoadingTrialBalance ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trialBalanceData ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Debit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {trialBalanceData.accounts.map((account) => (
                        <tr key={account.account_id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                            {account.account_code}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {account.account_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            {account.debit_balance > 0 ? formatCurrency(account.debit_balance, currency) : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            {account.credit_balance > 0 ? formatCurrency(account.credit_balance, currency) : ''}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(trialBalanceData.totalDebits, currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(trialBalanceData.totalCredits, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {!trialBalanceData.isBalanced && (
                    <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-md">
                      <p className="text-warning flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        The trial balance is not balanced. There is a difference of {formatCurrency(Math.abs(trialBalanceData.totalDebits - trialBalanceData.totalCredits), currency)}.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for the selected date.</p>
                </div>
              )
            )}
            
            {/* Income Statement */}
            {activeTab === 'income-statement' && (
              isLoadingIncomeStatement ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : incomeStatementData ? (
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-medium mb-4">
                    For the period {format(dateRange.from, 'MMMM d, yyyy')} to {format(dateRange.to, 'MMMM d, yyyy')}
                  </h4>
                  
                  {/* Revenues */}
                  <h5 className="text-md font-medium mb-2">Revenues</h5>
                  <table className="min-w-full divide-y divide-border mb-6">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {incomeStatementData.revenues.length > 0 ? (
                        incomeStatementData.revenues.map((account) => (
                          <tr key={account.account_id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatCurrency(account.amount, currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                            No revenue data for this period
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total Revenue
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(incomeStatementData.totalRevenue, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Expenses */}
                  <h5 className="text-md font-medium mb-2">Expenses</h5>
                  <table className="min-w-full divide-y divide-border mb-6">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {incomeStatementData.expenses.length > 0 ? (
                        incomeStatementData.expenses.map((account) => (
                          <tr key={account.account_id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatCurrency(account.amount, currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                            No expense data for this period
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total Expenses
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(incomeStatementData.totalExpenses, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Net Income */}
                  <div className="bg-primary/10 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="text-lg font-semibold">Net Income</h5>
                      <div className="flex items-center">
                        {incomeStatementData.netIncome >= 0 ? (
                          <ArrowUp className="h-5 w-5 text-success mr-2" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-destructive mr-2" />
                        )}
                        <span className={`text-lg font-bold ${incomeStatementData.netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(Math.abs(incomeStatementData.netIncome), currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for the selected period.</p>
                </div>
              )
            )}
            
            {/* Balance Sheet */}
            {activeTab === 'balance-sheet' && (
              isLoadingBalanceSheet ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : balanceSheetData ? (
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-medium mb-4">
                    As of {format(asOfDate, 'MMMM d, yyyy')}
                  </h4>
                  
                  {/* Assets */}
                  <h5 className="text-md font-medium mb-2">Assets</h5>
                  <table className="min-w-full divide-y divide-border mb-6">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {balanceSheetData.assets.length > 0 ? (
                        balanceSheetData.assets.map((account) => (
                          <tr key={account.account_id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatCurrency(account.balance, currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                            No asset data available
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total Assets
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(balanceSheetData.totalAssets, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Liabilities */}
                  <h5 className="text-md font-medium mb-2">Liabilities</h5>
                  <table className="min-w-full divide-y divide-border mb-6">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {balanceSheetData.liabilities.length > 0 ? (
                        balanceSheetData.liabilities.map((account) => (
                          <tr key={account.account_id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatCurrency(account.balance, currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                            No liability data available
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total Liabilities
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(balanceSheetData.totalLiabilities, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Equity */}
                  <h5 className="text-md font-medium mb-2">Equity</h5>
                  <table className="min-w-full divide-y divide-border mb-6">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Account Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {balanceSheetData.equity.length > 0 ? (
                        balanceSheetData.equity.map((account) => (
                          <tr key={account.account_id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {formatCurrency(account.balance, currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-muted-foreground">
                            No equity data available
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/20 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>
                          Total Equity
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {formatCurrency(balanceSheetData.totalEquity, currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Total Liabilities and Equity */}
                  <div className="bg-primary/10 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <h5 className="text-lg font-semibold">Total Liabilities and Equity</h5>
                      <span className="text-lg font-bold">
                        {formatCurrency(balanceSheetData.totalLiabilities + balanceSheetData.totalEquity, currency)}
                      </span>
                    </div>
                  </div>
                  
                  {!balanceSheetData.isBalanced && (
                    <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-md">
                      <p className="text-warning flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        The balance sheet is not balanced. Assets ({formatCurrency(balanceSheetData.totalAssets, currency)}) 
                        should equal Liabilities + Equity ({formatCurrency(balanceSheetData.totalLiabilities + balanceSheetData.totalEquity, currency)}).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for the selected date.</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Reports;