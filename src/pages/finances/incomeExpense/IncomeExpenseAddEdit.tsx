import React, { useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Combobox } from '../../../components/ui2/combobox';
import { DatePickerInput } from '../../../components/ui2/date-picker';
import { useAccountRepository } from '../../../hooks/useAccountRepository';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { useCategoryRepository } from '../../../hooks/useCategoryRepository';
import { useFinancialSourceRepository } from '../../../hooks/useFinancialSourceRepository';
import { useIncomeExpenseService } from '../../../hooks/useIncomeExpenseService';
import { useFinancialTransactionHeaderRepository } from '../../../hooks/useFinancialTransactionHeaderRepository';
import { useIncomeExpenseTransactionRepository } from '../../../hooks/useIncomeExpenseTransactionRepository';
import BackButton from '../../../components/BackButton';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { ProgressDialog } from '../../../components/ui2/progress-dialog';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';

interface Entry {
  id?: string;
  accounts_account_id: string;
  fund_id: string;
  category_id: string;
  source_id: string;
  description?: string;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
}

interface IncomeExpenseAddEditProps {
  transactionType: 'income' | 'expense';
}

function IncomeExpenseAddEdit({ transactionType }: IncomeExpenseAddEditProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const svc = useIncomeExpenseService(transactionType);

  const createBatch = svc.createBatch;
  const updateBatch = svc.updateBatch;
  const { createMutation, updateMutation } = svc;

  const { useQuery: useHeaderQuery } = useFinancialTransactionHeaderRepository();
  const { useQuery: useIeQuery } = useIncomeExpenseTransactionRepository();

  const { useQuery: useAccountsQuery } = useAccountRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();

  const { data: accountsData, isLoading: accountsLoading } = useAccountsQuery();
  const { data: fundsData, isLoading: fundsLoading } = useFundsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: transactionType === 'income' ? 'income_transaction' : 'expense_transaction' } },
  });
  const { data: sourcesData, isLoading: sourcesLoading } = useSourcesQuery({
    filters: { is_active: { operator: 'eq', value: true } },
  });

  const { data: headerResponse, isLoading: headerLoading } = useHeaderQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEditMode,
  });

  const { data: entryResponse, isLoading: entryLoading } = useIeQuery({
    filters: { header_id: { operator: 'eq', value: id } },
    enabled: isEditMode,
  });

  const isLoading =
    accountsLoading ||
    fundsLoading ||
    categoriesLoading ||
    sourcesLoading ||
    headerLoading ||
    entryLoading;

  const accounts = accountsData?.data || [];
  const funds = React.useMemo(() => fundsData?.data || [], [fundsData?.data]);
  const categories = React.useMemo(() => categoriesData?.data || [], [categoriesData?.data]);
  const sources = React.useMemo(() => sourcesData?.data || [], [sourcesData?.data]);

  const accountOptions = React.useMemo(() => accounts.map(a => ({ value: a.id, label: a.name })), [accounts]);
  const fundOptions = React.useMemo(() => funds.map(f => ({ value: f.id, label: f.name })), [funds]);
  const categoryOptions = React.useMemo(() => categories.map(c => ({ value: c.id, label: c.name })), [categories]);
  const sourceOptions = React.useMemo(() => sources.map(s => ({ value: s.id, label: s.name })), [sources]);

  const [headerData, setHeaderData] = useState({
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const [entries, setEntries] = useState<Entry[]>([
    {
      accounts_account_id: '',
      fund_id: '',
      category_id: '',
      source_id: '',
      description: '',
      amount: 0,
      source_account_id: null,
      category_account_id: null,
    },
  ]);

  const [processing, setProcessing] = useState(false);

  const header = headerResponse?.data?.[0];
  const entryRecords = entryResponse?.data || [];
  const isDisabled = isEditMode && header && header.status !== 'draft';

  const { currency } = useCurrencyStore();

  useEffect(() => {
    if (isEditMode && header) {
      setHeaderData({
        transaction_date: header.transaction_date,
        description: header.description,
      });
    }
  }, [isEditMode, header]);

  useEffect(() => {
    if (isEditMode && entryRecords.length > 0) {
      setEntries(
        entryRecords.map((e: any) => ({
          id: e.id,
          accounts_account_id: e.account_id || '',
          fund_id: e.fund_id || '',
          category_id: e.category_id || '',
          source_id: e.source_id || '',
          description: e.description || '',
          amount: e.amount || 0,
          source_account_id: e.source_account_id || null,
          category_account_id: e.category_account_id || null,
        }))
      );
    }
  }, [isEditMode, entryRecords]);

  useEffect(() => {
    setEntries(prev =>
      prev.map(e => {
        const sourceAccount = sources.find(s => s.id === e.source_id)?.account_id;
        const categoryAccount = categories.find(c => c.id === e.category_id)?.chart_of_account_id;

        return {
          ...e,
          source_account_id: sourceAccount ?? e.source_account_id,
          category_account_id: categoryAccount ?? e.category_account_id,
        };
      })
    );
  }, [sources, categories, entryRecords]);

  const totalAmount = React.useMemo(() => entries.reduce((sum, e) => sum + Number(e.amount || 0), 0), [entries]);

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    entries.forEach(e => {
      const name = categories.find(c => c.id === e.category_id)?.name || 'Uncategorized';
      totals[name] = (totals[name] || 0) + Number(e.amount || 0);
    });
    return totals;
  }, [entries, categories]);

  if (
    isLoading &&
    (!accountsData || !fundsData || !categoriesData || !sourcesData || (isEditMode && !header))
  ) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEntryChange = (index: number, field: keyof Entry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    if (field === 'source_id') {
      newEntries[index].source_account_id = sources.find(s => s.id === value)?.account_id || null;
    }
    if (field === 'category_id') {
      newEntries[index].category_account_id = categories.find(c => c.id === value)?.chart_of_account_id || null;
    }
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        accounts_account_id: '',
        fund_id: '',
        category_id: '',
        source_id: '',
        description: '',
        amount: 0,
        source_account_id: null,
        category_account_id: null,
      },
    ]);
  };

  const removeEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const basePath = transactionType === 'income' ? 'giving' : 'expenses';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (isEditMode && id) {
        await updateBatch(id, headerData, entries);
      } else {
        await createBatch(headerData, entries);
      }
      navigate(`/finances/${basePath}`);
    } catch (error) {
      setProcessing(false);
    }
  };

  const backLabel = transactionType === 'income' ? 'Back to Donations' : 'Back to Expenses';
  const title = transactionType === 'income'
    ? isEditMode
      ? 'Edit Donation Batch'
      : 'New Donation Batch'
    : isEditMode
      ? 'Edit Expense'
      : 'New Expense';
  const entriesHeader = transactionType === 'income' ? 'Contributions' : 'Entries';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath={`/finances/${basePath}`} label={backLabel} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <h3 className="text-lg font-medium">{title}</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePickerInput
              label="Date"
              value={
                headerData.transaction_date
                  ? parse(headerData.transaction_date, 'yyyy-MM-dd', new Date())
                  : undefined
              }
              onChange={d =>
                setHeaderData({
                  ...headerData,
                  transaction_date: d ? format(d, 'yyyy-MM-dd') : ''
                })
              }
              required
              disabled={isDisabled}
            />
            <Input
              label="Description"
              value={headerData.description}
              onChange={e => setHeaderData({ ...headerData, description: e.target.value })}
              required
              disabled={isDisabled}
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{entriesHeader}</h3>
            <Button type="button" onClick={addEntry} className="flex items-center" disabled={isDisabled}>
              <Plus className="h-4 w-4 mr-2" /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted text-xs text-muted-foreground dark:bg-slate-700">
                  <th className="px-4 py-2 text-left">Account</th>
                  <th className="px-4 py-2 text-left">Fund</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left min-w-[200px]">Description</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-border dark:border-slate-700">
                    <td className="px-4 py-2">
                      <Combobox
                        options={accountOptions}
                        value={entry.accounts_account_id || ''}
                        onChange={v => handleEntryChange(idx, 'accounts_account_id', v)}
                        disabled={isDisabled}
                        placeholder="Select account"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Combobox
                        options={fundOptions}
                        value={entry.fund_id || ''}
                        onChange={v => handleEntryChange(idx, 'fund_id', v)}
                        disabled={isDisabled}
                        placeholder="Select fund"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Combobox
                        options={categoryOptions}
                        value={entry.category_id || ''}
                        onChange={v => handleEntryChange(idx, 'category_id', v)}
                        disabled={isDisabled}
                        placeholder="Select category"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Combobox
                        options={sourceOptions}
                        value={entry.source_id || ''}
                        onChange={v => handleEntryChange(idx, 'source_id', v)}
                        disabled={isDisabled}
                        placeholder="Select source"
                      />
                    </td>
                    <td className="px-4 py-2 min-w-[200px]">
                      <Input
                        value={entry.description || ''}
                        onChange={e => handleEntryChange(idx, 'description', e.target.value)}
                        disabled={isDisabled}
                        placeholder="Description"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Input
                        type="number"
                        value={entry.amount}
                        onChange={e => handleEntryChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        disabled={isDisabled}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(idx)} disabled={isDisabled}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-medium">
                  <td className="px-4 py-2" colSpan={5}>Total</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(totalAmount, currency)}
                  </td>
                  <td className="px-4 py-2"></td>
                </tr>
              </tfoot>
            </table>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Category Totals</h4>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(categoryTotals).map(([name, amt]) => (
                    <tr key={name} className="border-b border-border">
                      <td className="px-4 py-1">{name}</td>
                      <td className="px-4 py-1 text-right">{formatCurrency(amt, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isDisabled || createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      <ProgressDialog open={processing} message="Saving transaction..." />
    </div>
  );
}

export default IncomeExpenseAddEdit;
