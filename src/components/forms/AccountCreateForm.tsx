import React, { useState } from 'react';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { AccountType } from '../../models/account.model';
import { Input } from '../ui2/input';
import { Button } from '../ui2/button';
import { Textarea } from '../ui2/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui2/select';
import { Combobox } from '../ui2/combobox';
import { Switch } from '../ui2/switch';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AccountCreateFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function AccountCreateForm({ onCancel, onSuccess }: AccountCreateFormProps) {
  const { useCreate } = useAccountRepository();
  const createMutation = useCreate();
  const { useQuery: useMembersQuery } = useMemberRepository();

  const { data: membersData, isLoading: isMembersLoading } = useMembersQuery();
  const members = membersData?.data || [];
  const memberOptions = React.useMemo(
    () => members.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` })) || [],
    [members]
  );

  const [formData, setFormData] = useState({
    name: '',
    account_type: 'organization' as AccountType,
    account_number: '',
    description: '',
    member_id: null as string | null,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      await createMutation.mutateAsync({ data: formData });
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground">Account Type</label>
        <Select value={formData.account_type} onValueChange={(v) => handleChange('account_type', v as AccountType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="person">Person</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        label="Account Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />
      {formData.account_type === 'person' && (
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Person
          </label>
          {isMembersLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading members...</span>
            </div>
          ) : (
            <Combobox
              options={memberOptions}
              value={formData.member_id || ''}
              onChange={(value) => handleChange('member_id', value)}
              placeholder="Select a person"
            />
          )}
        </div>
      )}
      <Input
        label="Account Number"
        value={formData.account_number}
        onChange={(e) => handleChange('account_number', e.target.value)}
      />
      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        rows={3}
      />
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(v) => handleChange('is_active', v)}
        />
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
