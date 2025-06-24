import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { Input } from '../../../components/ui2/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui2/select';
import { DatePickerInput } from '../../../components/ui2/date-picker';
import { useAccountRepository } from '../../../hooks/useAccountRepository';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { useCategoryRepository } from '../../../hooks/useCategoryRepository';
import { useFinancialSourceRepository } from '../../../hooks/useFinancialSourceRepository';
import { useGivingService, ContributionEntry } from '../../../hooks/useGivingService';
import BackButton from '../../../components/BackButton';
import { Plus, Trash2, Loader2 } from 'lucide-react';

function GivingAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { createGivingBatch, updateGivingBatch, createMutation, updateMutation } = useGivingService();

  const { useQuery: useAccountsQuery } = useAccountRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();

  const { data: accountsData } = useAccountsQuery();
  const { data: fundsData } = useFundsQuery();
  const { data: categoriesData } = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: 'income_transaction' } },
  });
  const { data: sourcesData } = useSourcesQuery({
    filters: { is_active: { operator: 'eq', value: true } },
  });

  const accounts = accountsData?.data || [];
  const funds = fundsData?.data || [];
  const categories = categoriesData?.data || [];
  const sources = sourcesData?.data || [];

  const [headerData, setHeaderData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [entries, setEntries] = useState<ContributionEntry[]>([
    {
      accounts_account_id: '',
      fund_id: '',
      category_id: '',
      source_id: '',
      amount: 0,
      source_account_id: null,
      category_account_id: null,
    },
  ]);

  useEffect(() => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        source_account_id: sources.find((s) => s.id === e.source_id)?.account_id || null,
        category_account_id: categories.find((c) => c.id === e.category_id)?.chart_of_account_id || null,
      })),
    );
  }, [sources, categories]);

  const handleEntryChange = (index: number, field: keyof ContributionEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    if (field === 'source_id') {
      newEntries[index].source_account_id = sources.find((s) => s.id === value)?.account_id || null;
    }
    if (field === 'category_id') {
      newEntries[index].category_account_id = categories.find((c) => c.id === value)?.chart_of_account_id || null;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && id) {
      await updateGivingBatch(id, headerData, entries);
    } else {
      await createGivingBatch(headerData, entries);
    }
    navigate('/finances/giving');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/giving" label="Back to Giving" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <h3 className="text-lg font-medium">{isEditMode ? 'Edit Giving Batch' : 'New Giving Batch'}</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePickerInput
              label="Date"
              value={headerData.transaction_date ? new Date(headerData.transaction_date) : undefined}
              onChange={(d) => setHeaderData({ ...headerData, transaction_date: d ? d.toISOString().split('T')[0] : '' })}
              required
            />
            <Input
              label="Description"
              value={headerData.description}
              onChange={(e) => setHeaderData({ ...headerData, description: e.target.value })}
              required
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Contributions</h3>
            <Button type="button" onClick={addEntry} className="flex items-center">
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
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-border dark:border-slate-700">
                    <td className="px-4 py-2">
                      <Select value={entry.accounts_account_id || ''} onValueChange={(v) => handleEntryChange(idx, 'accounts_account_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((a: any) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <Select value={entry.fund_id || ''} onValueChange={(v) => handleEntryChange(idx, 'fund_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fund" />
                        </SelectTrigger>
                        <SelectContent>
                          {funds.map((f: any) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <Select value={entry.category_id || ''} onValueChange={(v) => handleEntryChange(idx, 'category_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2">
                      <Select value={entry.source_id || ''} onValueChange={(v) => handleEntryChange(idx, 'source_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Input
                        type="number"
                        value={entry.amount}
                        onChange={(e) => handleEntryChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEntry(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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
    </div>
  );
}

export default GivingAddEdit;
