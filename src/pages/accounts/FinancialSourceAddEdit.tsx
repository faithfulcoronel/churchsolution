import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFinancialSourceRepository } from '../../hooks/useFinancialSourceRepository';
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts';
import { FinancialSource, SourceType } from '../../models/financialSource.model';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import BackButton from '../../components/BackButton';
import { Textarea } from '../../components/ui2/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui2/select';
import { Combobox } from '../../components/ui2/combobox';
import { Label } from '../../components/ui2/label';
import { Switch } from '../../components/ui2/switch';
import { Save, Loader2, Briefcase as Bank, Wallet, Globe, CreditCard, AlertCircle, Hash, FileText } from 'lucide-react';

function FinancialSourceAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { useQuery: useSourceQuery, useCreate, useUpdate } = useFinancialSourceRepository();
  const { useAccountOptions } = useChartOfAccounts();
  
  const [formData, setFormData] = useState<Partial<FinancialSource>>({
    name: '',
    source_type: 'bank',
    account_id: '',
    account_number: '',
    description: '',
    is_active: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Fetch source data if in edit mode
  const { data: sourceData, isLoading: isSourceLoading } = useSourceQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    enabled: isEditMode
  });
  
  // Create and update mutations
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const { data: accountOptions, isLoading: isAccountsLoading } = useAccountOptions();
  
  // Set form data when source data is loaded
  useEffect(() => {
    if (isEditMode && sourceData?.data?.[0]) {
      setFormData(sourceData.data[0]);
    }
  }, [isEditMode, sourceData]);
  
  const handleInputChange = (field: keyof FinancialSource, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        setError('Source name is required');
        return;
      }
      
      if (!formData.source_type) {
        setError('Source type is required');
        return;
      }

      if (!formData.account_id) {
        setError('Account is required');
        return;
      }
      
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: id!,
          data: formData
        });
        navigate(`/accounts/sources/${id}`);
      } else {
        const result = await createMutation.mutateAsync({
          data: formData
        });
        navigate(`/accounts/sources/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving financial source:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  const getSourceTypeIcon = (type: SourceType) => {
    switch (type) {
      case 'bank':
        return <Bank className="h-5 w-5 text-primary" />;
      case 'fund':
        return <Bank className="h-5 w-5 text-secondary" />;
      case 'wallet':
        return <Wallet className="h-5 w-5 text-primary" />;
      case 'cash':
        return <Wallet className="h-5 w-5 text-success" />;
      case 'online':
        return <Globe className="h-5 w-5 text-info" />;
      default:
        return <CreditCard className="h-5 w-5 text-warning" />;
    }
  };
  
  if (isEditMode && isSourceLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/accounts/sources" label="Back to Financial Sources" />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            {getSourceTypeIcon(formData.source_type as SourceType)}
            <h3 className="text-lg font-medium text-foreground ml-2">
              {isEditMode ? 'Edit Financial Source' : 'Add New Financial Source'}
            </h3>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Source Name"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter source name"
                />
              </div>
              
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Source Type
                </label>
                <Select
                  value={formData.source_type || 'bank'}
                  onValueChange={(value) => handleInputChange('source_type', value as SourceType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">
                      <div className="flex items-center">
                        <Bank className="h-4 w-4 mr-2 text-primary" />
                        Bank Account
                      </div>
                    </SelectItem>
                    <SelectItem value="fund">
                      <div className="flex items-center">
                        <Bank className="h-4 w-4 mr-2 text-primary" />
                        Fund Account
                      </div>
                    </SelectItem>
                    <SelectItem value="wallet">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-primary" />
                        Wallet
                      </div>
                    </SelectItem>
                    <SelectItem value="cash">
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2 text-success" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="online">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-info" />
                        Online Payment
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-warning" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-1">
                <Label htmlFor="account_id">Account *</Label>
                {isAccountsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading accounts...</span>
                  </div>
                ) : (
                  <Combobox
                    options={accountOptions || []}
                    value={formData.account_id || ''}
                    onChange={(value) => handleInputChange('account_id', value)}
                    placeholder="Select account"
                  />
                )}
              </div>
              
              <div className="sm:col-span-1">
                <Input
                  label="Account Number"
                  value={formData.account_number || ''}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  placeholder="Enter account number (if applicable)"
                  icon={<Hash className="h-4 w-4" />}
                />
              </div>
              
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter source description"
                  rows={3}
                />
              </div>
              
              <div className="sm:col-span-2 flex items-center space-x-2">
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <label className="text-sm font-medium text-foreground">
                  Source is active
                </label>
              </div>
            </div>
            
            {error && (
              <div className="rounded-lg bg-destructive/15 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/accounts/sources')}
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
                    {isEditMode ? 'Update Source' : 'Create Source'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialSourceAddEdit;