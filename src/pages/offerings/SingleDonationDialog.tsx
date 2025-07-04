import React from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui2/dialog';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Combobox } from '../../components/ui2/combobox';
import { DatePickerInput } from '../../components/ui2/date-picker';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../../components/ui2/form';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useFundRepository } from '../../hooks/useFundRepository';
import { useCategoryRepository } from '../../hooks/useCategoryRepository';
import { useFinancialSourceRepository } from '../../hooks/useFinancialSourceRepository';
import { useIncomeExpenseService } from '../../hooks/useIncomeExpenseService';

interface SingleDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  transaction_date: Date;
  description: string;
  account_id: string;
  fund_id: string;
  category_id: string;
  source_id: string;
  amount: string;
}

export default function SingleDonationDialog({ open, onOpenChange }: SingleDonationDialogProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      transaction_date: new Date(),
      description: '',
      account_id: '',
      fund_id: '',
      category_id: '',
      source_id: '',
      amount: '',
    },
  });

  const { useQuery: useAccountsQuery } = useAccountRepository();
  const { useQuery: useFundsQuery } = useFundRepository();
  const { useQuery: useCategoriesQuery } = useCategoryRepository();
  const { useQuery: useSourcesQuery } = useFinancialSourceRepository();
  const svc = useIncomeExpenseService('income');

  const accountsRes = useAccountsQuery();
  const fundsRes = useFundsQuery();
  const categoriesRes = useCategoriesQuery({
    filters: { type: { operator: 'eq', value: 'income_transaction' } },
  });
  const sourcesRes = useSourcesQuery({
    filters: { is_active: { operator: 'eq', value: true } },
  });

  const accounts = accountsRes.data?.data || [];
  const funds = fundsRes.data?.data || [];
  const categories = categoriesRes.data?.data || [];
  const sources = sourcesRes.data?.data || [];

  const isLoading =
    accountsRes.isLoading ||
    fundsRes.isLoading ||
    categoriesRes.isLoading ||
    sourcesRes.isLoading;

  const accountOptions = React.useMemo(
    () => accounts.map(a => ({ value: a.id, label: a.name })),
    [accounts]
  );
  const fundOptions = React.useMemo(
    () => funds.map(f => ({ value: f.id, label: f.name })),
    [funds]
  );
  const categoryOptions = React.useMemo(
    () => categories.map(c => ({ value: c.id, label: c.name })),
    [categories]
  );
  const sourceOptions = React.useMemo(
    () => sources.map(s => ({ value: s.id, label: s.name })),
    [sources]
  );

  const onSubmit = async (values: FormValues) => {
    await svc.createBatch(
      {
        transaction_date: format(values.transaction_date, 'yyyy-MM-dd'),
        description: values.description,
      },
      [
        {
          accounts_account_id: values.account_id,
          fund_id: values.fund_id,
          category_id: values.category_id,
          source_id: values.source_id,
          amount: parseFloat(values.amount || '0'),
          source_account_id: sources.find(s => s.id === values.source_id)?.account_id || null,
          category_account_id: categories.find(c => c.id === values.category_id)?.chart_of_account_id || null,
        },
      ]
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Donation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transaction_date"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePickerInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_id"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <FormControl>
                    <Combobox
                      options={accountOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isLoading ? 'Loading...' : 'Select account'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fund_id"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund</FormLabel>
                  <FormControl>
                    <Combobox
                      options={fundOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isLoading ? 'Loading...' : 'Select fund'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Combobox
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isLoading ? 'Loading...' : 'Select category'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source_id"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Combobox
                      options={sourceOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isLoading ? 'Loading...' : 'Select source'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={svc.createMutation.isPending}>
                {svc.createMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
