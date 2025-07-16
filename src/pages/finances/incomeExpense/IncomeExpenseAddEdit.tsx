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
import { DataGrid, GridColDef } from '../../../components/ui2/mui-datagrid';
import { useGridApiRef } from '@mui/x-data-grid';
import { uniqueID } from '../../../lib/helpers';
import { ProgressDialog } from '../../../components/ui2/progress-dialog';
import { useCurrencyStore } from '../../../stores/currencyStore';
import { formatCurrency } from '../../../utils/currency';

interface Entry {
  localId: string;
  id?: string;
  accounts_account_id: string;
  fund_id: string;
  category_id: string;
  source_id: string;
  description?: string;
  amount: number;
  source_account_id: string | null;
  category_account_id: string | null;
  line?: number;
  isDirty?: boolean;
  isDeleted?: boolean;
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

  const {
    data: accountsData,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAccountsQuery();
  const {
    data: fundsData,
    isLoading: fundsLoading,
    refetch: refetchFunds,
  } = useFundsQuery();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: transactionType === 'income' ? 'income_transaction' : 'expense_transaction' } },
  });
  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    refetch: refetchSources,
  } = useSourcesQuery({
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
      localId: uniqueID(),
      accounts_account_id: '',
      fund_id: '',
      category_id: '',
      source_id: '',
      description: '',
      amount: 0,
      source_account_id: null,
      category_account_id: null,
      line: 1,
      isDirty: true,
      isDeleted: false,
    },
  ]);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const header = headerResponse?.data?.[0];
  const entryRecords = entryResponse?.data || [];
  const isDisabled = isEditMode && header && header.status !== 'draft';

  const { currency } = useCurrencyStore();
  const apiRef = useGridApiRef();

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
        entryRecords.map((e: any, idx: number) => ({
          localId: e.id || uniqueID(),
          id: e.id,
          accounts_account_id: e.account_id || '',
          fund_id: e.fund_id || '',
          category_id: e.category_id || '',
          source_id: e.source_id || '',
          description: e.description || '',
          amount: e.amount || 0,
          source_account_id: e.source_account_id || null,
          category_account_id: e.category_account_id || null,
          line: e.line ?? idx + 1,
          isDirty: e.line == null,
          isDeleted: false,
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

  const visibleEntries = React.useMemo(
    () =>
      entries
        .filter(e => !e.isDeleted)
        .sort((a, b) => (a.line ?? 0) - (b.line ?? 0)),
    [entries]
  );

  const totalAmount = React.useMemo(
    () => visibleEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [visibleEntries]
  );

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    visibleEntries.forEach(e => {
      const name = categories.find(c => c.id === e.category_id)?.name || 'Uncategorized';
      totals[name] = (totals[name] || 0) + Number(e.amount || 0);
    });
    return totals;
  }, [visibleEntries, categories]);

  const columns = React.useMemo<GridColDef<Entry>[]>(
    () => [
      {
        field: 'line',
        headerName: 'Line',
        width: 80,
        sortable: false,
        filterable: false,
        valueGetter: params =>
          visibleEntries.findIndex(e => e.localId === params.row.localId) + 1,
      },
      {
        field: 'accounts_account_id',
        headerName: 'Account',
        flex: 1,
        minWidth: 150,
        editable: !isDisabled,
        valueGetter: params =>
          accounts.find(a => a.id === params.row.accounts_account_id)?.name || '',
        renderEditCell: params => (
          <Combobox
            options={accountOptions}
            value={params.row.accounts_account_id || ''}
            onChange={v => handleEntryChangeById(params.id as string, 'accounts_account_id', v)}
            disabled={isDisabled}
            placeholder="Select account"
            onOpen={refetchAccounts}
          />
        ),
      },
      {
        field: 'fund_id',
        headerName: 'Fund',
        flex: 1,
        minWidth: 120,
        editable: !isDisabled,
        valueGetter: params =>
          funds.find(f => f.id === params.row.fund_id)?.name || '',
        renderEditCell: params => (
          <Combobox
            options={fundOptions}
            value={params.row.fund_id || ''}
            onChange={v => handleEntryChangeById(params.id as string, 'fund_id', v)}
            disabled={isDisabled}
            placeholder="Select fund"
            onOpen={refetchFunds}
          />
        ),
      },
      {
        field: 'category_id',
        headerName: 'Category',
        flex: 1,
        minWidth: 150,
        editable: !isDisabled,
        valueGetter: params =>
          categories.find(c => c.id === params.row.category_id)?.name || '',
        renderEditCell: params => (
          <Combobox
            options={categoryOptions}
            value={params.row.category_id || ''}
            onChange={v => handleEntryChangeById(params.id as string, 'category_id', v)}
            disabled={isDisabled}
            placeholder="Select category"
            onOpen={refetchCategories}
          />
        ),
      },
      {
        field: 'source_id',
        headerName: 'Source',
        flex: 1,
        minWidth: 120,
        editable: !isDisabled,
        valueGetter: params =>
          sources.find(s => s.id === params.row.source_id)?.name || '',
        renderEditCell: params => (
          <Combobox
            options={sourceOptions}
            value={params.row.source_id || ''}
            onChange={v => handleEntryChangeById(params.id as string, 'source_id', v)}
            disabled={isDisabled}
            placeholder="Select source"
            onOpen={refetchSources}
          />
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.5,
        minWidth: 200,
        editable: !isDisabled,
      },
      {
        field: 'amount',
        headerName: 'Amount',
        type: 'number',
        flex: 1,
        minWidth: 120,
        editable: !isDisabled,
        valueFormatter: params => formatCurrency(Number(params.value || 0), currency),
      },
      {
        field: 'actions',
        headerName: '',
        width: 60,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEntryById(params.id as string)}
            disabled={isDisabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [
      visibleEntries,
      accounts,
      funds,
      categories,
      sources,
      accountOptions,
      fundOptions,
      categoryOptions,
      sourceOptions,
      currency,
      isDisabled,
    ]
  );

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
    newEntries[index] = { ...newEntries[index], [field]: value, isDirty: true };
    if (field === 'source_id') {
      newEntries[index].source_account_id = sources.find(s => s.id === value)?.account_id || null;
    }
    if (field === 'category_id') {
      newEntries[index].category_account_id = categories.find(c => c.id === value)?.chart_of_account_id || null;
    }
    setEntries(newEntries);
  };

  const addEntry = React.useCallback(() => {
    const newId = uniqueID();
    setEntries(prev => {
      const nextLine = prev.filter(e => !e.isDeleted).length + 1;
      return [
        ...prev,
        {
          localId: newId,
          accounts_account_id: '',
          fund_id: '',
          category_id: '',
          source_id: '',
          description: '',
          amount: 0,
          source_account_id: null,
          category_account_id: null,
          line: nextLine,
          isDirty: true,
          isDeleted: false,
        },
      ];
    });
    return newId;
  }, []);

  const removeEntry = (index: number) => {
    const entry = entries[index];
    const newEntries = [...entries];
    if (entry.id) {
      newEntries[index] = { ...entry, isDeleted: true };
    } else {
      newEntries.splice(index, 1);
    }
    setEntries(newEntries);
  };

  const handleEntryChangeById = (entryId: string, field: keyof Entry, value: any) => {
    const idx = entries.findIndex(e => e.localId === entryId);
    if (idx !== -1) {
      handleEntryChange(idx, field, value);
    }
  };

  const removeEntryById = (entryId: string) => {
    const idx = entries.findIndex(e => e.localId === entryId);
    if (idx !== -1) {
      removeEntry(idx);
    }
  };

  const editableFields = [
    'accounts_account_id',
    'fund_id',
    'category_id',
    'source_id',
    'description',
    'amount',
  ];

  const handleCellKeyDown = React.useCallback(
    (params: any, event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        apiRef.current.stopCellEditMode({ id: params.id, field: params.field });

        const idx = editableFields.indexOf(params.field);
        if (idx !== -1) {
          if (idx === editableFields.length - 1) {
            const newId = addEntry();
            setTimeout(() => {
              apiRef.current.startCellEditMode({
                id: newId,
                field: 'accounts_account_id',
              });
              apiRef.current.setCellFocus(newId, 'accounts_account_id');
            });
          } else {
            const nextField = editableFields[idx + 1];
            setTimeout(() => {
              apiRef.current.startCellEditMode({ id: params.id, field: nextField });
              apiRef.current.setCellFocus(params.id, nextField);
            });
          }
        }
      }
    },
    [apiRef, addEntry]
  );

  const handleCellEdit = React.useCallback((params: any) => {
    if (
      [
        'accounts_account_id',
        'fund_id',
        'category_id',
        'source_id',
      ].includes(params.field)
    ) {
      return;
    }
    handleEntryChangeById(
      params.id as string,
      params.field as keyof Entry,
      params.field === 'amount' ? parseFloat(params.value) || 0 : params.value
    );
  }, []);

  const basePath = transactionType === 'income' ? 'giving' : 'expenses';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setProgress(0);
    try {
      const preparedEntries = entries.map(e => ({ ...e }));
      let currentLine = 1;
      for (const entry of preparedEntries) {
        if (!entry.isDeleted) {
          const newLine = currentLine++;
          if (entry.line !== newLine) {
            entry.line = newLine;
            entry.isDirty = true;
          }
        }
      }

      if (isEditMode && id) {
        await updateBatch(id, headerData, preparedEntries, p => setProgress(p));
      } else {
        await createBatch(headerData, preparedEntries, p => setProgress(p));
      }
      setProgress(undefined);
      navigate(`/finances/${basePath}`);
    } catch (error) {
      setProcessing(false);
      setProgress(undefined);
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
          <CardHeader>
            <h3 className="text-lg font-medium">{entriesHeader}</h3>
          </CardHeader>
          <CardContent className="overflow-x-auto space-y-4">
            <DataGrid<Entry>
              columns={columns}
              data={visibleEntries}
              totalRows={visibleEntries.length}
              paginationMode="client"
              autoHeight
              getRowId={row => row.localId}
              processRowUpdate={(r) => r}
              onCellEditCommit={handleCellEdit}
              onCellKeyDown={handleCellKeyDown}
              apiRef={apiRef}
            />
            <div className="text-right font-medium">
              Total: {formatCurrency(totalAmount, currency)}
            </div>
            <div className="mt-4">
              <Button type="button" onClick={addEntry} className="flex items-center" disabled={isDisabled}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            </div>
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
      <ProgressDialog open={processing} message="Saving transaction..." progress={progress} />
    </div>
  );
}

export default IncomeExpenseAddEdit;
