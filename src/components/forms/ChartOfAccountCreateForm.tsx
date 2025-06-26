import React, { useState } from 'react';
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts';
import { AccountType } from '../../models/chartOfAccount.model';
import { Input } from '../ui2/input';
import { Button } from '../ui2/button';
import { Textarea } from '../ui2/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui2/select';
import { Combobox } from '../ui2/combobox';
import { Switch } from '../ui2/switch';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ChartOfAccountCreateFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function ChartOfAccountCreateForm({ onCancel, onSuccess }: ChartOfAccountCreateFormProps) {
  const { useCreateAccount, useAccountOptions } = useChartOfAccounts();
  const createMutation = useCreateAccount();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    account_type: 'asset' as AccountType,
    account_subtype: '',
    description: '',
    is_active: true,
    parent_id: null as string | null,
  });
  const {
    data: parentOptions,
    isLoading: isLoadingParents,
  } = useAccountOptions(formData.account_type);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim()) {
      setError('Account code is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...formData,
        account_subtype: formData.account_subtype || null,
        parent_id: formData.parent_id,
      });
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Account Code"
        value={formData.code}
        onChange={(e) => handleChange('code', e.target.value)}
        required
      />
      <Input
        label="Account Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">Account Type</label>
        <Select value={formData.account_type} onValueChange={(v) => handleChange('account_type', v as AccountType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asset">Asset</SelectItem>
            <SelectItem value="liability">Liability</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        label="Account Subtype (Optional)"
        value={formData.account_subtype}
        onChange={(e) => handleChange('account_subtype', e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">Parent Account (Optional)</label>
        {isLoadingParents ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading accounts...</span>
          </div>
        ) : (
          <Combobox
            options={parentOptions || []}
            value={formData.parent_id || ''}
            onChange={(value) => handleChange('parent_id', value || null)}
            placeholder="Select parent account"
          />
        )}
      </div>
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        rows={3}
      />
      <div className="flex items-center space-x-2">
        <Switch checked={formData.is_active} onCheckedChange={(v) => handleChange('is_active', v)} />
        <label className="text-sm font-medium">Account is active</label>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 flex items-start text-destructive">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={createMutation.isPending}>Create</Button>
      </div>
    </form>
  );
}
