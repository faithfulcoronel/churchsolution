import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChartOfAccountRepository } from '../../hooks/useChartOfAccountRepository';
import { ChartOfAccount } from '../../models/chartOfAccount.model';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import BackButton from '../../components/BackButton';
import { Textarea } from '../../components/ui2/textarea';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../../components/ui2/select';
import { Switch } from '../../components/ui2/switch';
import { 
  Save,
  Loader2,
  BookOpen, 
  Hash, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

function ChartOfAccountAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { useQuery, useCreate, useUpdate } = useChartOfAccountRepository();
  
  // Form state
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    code: '',
    name: '',
    description: '',
    account_type: 'asset',
    account_subtype: '',
    is_active: true,
    parent_id: null
  });
  
  // Error state
  const [errors, setErrors] = useState<{
    code?: string;
    name?: string;
    account_type?: string;
    general?: string;
  }>({});
  
  // Get account data if in edit mode
  const { data: accountData, isLoading: isAccountLoading } = useQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    enabled: isEditMode
  });
  
  // Get all accounts for parent selection
  const { data: allAccountsData, isLoading: isAllAccountsLoading } = useQuery();
  
  // Create and update mutations
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  
  // Set form data when account data is loaded
  useEffect(() => {
    if (isEditMode && accountData?.data?.[0]) {
      setFormData(accountData.data[0]);
    }
  }, [isEditMode, accountData]);
  
  // Handle input change
  const handleInputChange = (field: keyof ChartOfAccount, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.code?.trim()) {
      newErrors.code = 'Account code is required';
    } else if (!/^[0-9]+$/.test(formData.code)) {
      newErrors.code = 'Account code must contain only numbers';
    }
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!formData.account_type) {
      newErrors.account_type = 'Account type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: id!,
          data: formData
        });
        navigate(`/accounts/chart-of-accounts/${id}`);
      } else {
        const result = await createMutation.mutateAsync({
          data: formData
        });
        navigate(`/accounts/chart-of-accounts/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'An error occurred while saving the account'
      }));
    }
  };
  
  // Filter accounts for parent selection (only show accounts of the same type)
  const filteredParentAccounts = allAccountsData?.data.filter(account => 
    account.account_type === formData.account_type && account.id !== id
  ) || [];
  
  if (isEditMode && isAccountLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/accounts/chart-of-accounts" label="Back to Chart of Accounts" />
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Edit Account' : 'Add New Account'}
              </h3>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      {errors.general}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Account Code"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="Enter account code (e.g., 1000)"
                  icon={<Hash className="h-4 w-4" />}
                  error={errors.code}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Use a numeric code that follows your accounting system structure
                </p>
              </div>
              
              <div>
                <Input
                  label="Account Name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter account name"
                  error={errors.name}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Account Type
                </label>
                <Select
                  value={formData.account_type || 'asset'}
                  onValueChange={(value) => {
                    handleInputChange('account_type', value);
                    // Clear parent_id when changing account type
                    handleInputChange('parent_id', null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                {errors.account_type && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.account_type}</p>
                )}
              </div>
              
              <div>
                <Input
                  label="Account Subtype (Optional)"
                  value={formData.account_subtype || ''}
                  onChange={(e) => handleInputChange('account_subtype', e.target.value)}
                  placeholder="E.g., Current Asset, Fixed Asset"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Further categorize accounts of the same type
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Parent Account (Optional)
                </label>
                <Select
                  value={formData.parent_id || undefined}
                  onValueChange={(value) => handleInputChange('parent_id', value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>None (Top-level Account)</SelectItem>
                    {isAllAccountsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading accounts...
                      </SelectItem>
                    ) : (
                      filteredParentAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optionally nest this account under a parent account of the same type
                </p>
              </div>
              
              <div className="sm:col-span-2">
                <Textarea
                  label="Description (Optional)"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter a description for this account"
                  rows={3}
                />
              </div>
              
              <div className="sm:col-span-2 flex items-center space-x-2">
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium text-foreground">
                  Account is active
                </label>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/accounts/chart-of-accounts')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Account' : 'Create Account'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default ChartOfAccountAddEdit;