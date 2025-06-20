import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountRepository } from '../../hooks/useAccountRepository';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { Account, AccountType } from '../../models/account.model';
import { Card, CardHeader, CardContent } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { Textarea } from '../../components/ui2/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui2/select';
import { Combobox } from '../../components/ui2/combobox';
import { Switch } from '../../components/ui2/switch';
import { Tabs } from '../../components/ui2/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Hash,
  AlertCircle,
} from 'lucide-react';

function AccountAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const { useQuery: useAccountQuery, useCreate, useUpdate } = useAccountRepository();
  const { useQuery: useMembersQuery } = useMemberRepository();
  
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    account_type: 'organization',
    account_number: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    tax_id: '',
    is_active: true,
    notes: '',
    member_id: null,
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  
  // Fetch account data if in edit mode
  const { data: accountData, isLoading: isAccountLoading } = useAccountQuery({
    filters: {
      id: {
        operator: 'eq',
        value: id
      }
    },
    enabled: isEditMode
  });
  
  // Fetch members for linking
  const { data: membersData, isLoading: isMembersLoading } = useMembersQuery();
  const members = membersData?.data || [];
  
  // Create and update mutations
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  
  // Set form data when account data is loaded
  useEffect(() => {
    if (isEditMode && accountData?.data?.[0]) {
      setFormData(accountData.data[0]);
      
      // Set account type tab
      setActiveTab('basic');
    }
  }, [isEditMode, accountData]);
  
  const handleInputChange = (field: keyof Account, value: any) => {
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
        setError('Account name is required');
        return;
      }
      
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: id!,
          data: formData
        });
        navigate(`/accounts/${id}`);
      } else {
        const result = await createMutation.mutateAsync({
          data: formData
        });
        navigate(`/accounts/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  const memberOptions = React.useMemo(() => 
    members.map(m => ({
      value: m.id,
      label: `${m.first_name} ${m.last_name}`
    })) || [], 
    [members]
  );
  
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
        <Button
          variant="ghost"
          onClick={() => navigate('/accounts')}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Accounts
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            {formData.account_type === 'organization' ? (
              <Building2 className="h-6 w-6 text-primary mr-2" />
            ) : (
              <User className="h-6 w-6 text-success mr-2" />
            )}
            <h3 className="text-lg font-medium text-foreground">
              {isEditMode ? 'Edit Account' : 'Add New Account'}
            </h3>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs
              tabs={[
                {
                  id: 'basic',
                  label: 'Basic Information',
                  icon: <FileText className="h-5 w-5" />,
                },
                {
                  id: 'contact',
                  label: 'Contact Details',
                  icon: <Mail className="h-5 w-5" />,
                },
                {
                  id: 'additional',
                  label: 'Additional Info',
                  icon: <FileText className="h-5 w-5" />,
                }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="enclosed"
              size="sm"
            />
            
            <div className="mt-6">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Select
                        value={formData.account_type || 'organization'}
                        onValueChange={(value) => handleInputChange('account_type', value as AccountType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="organization">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-primary" />
                              Organization
                            </div>
                          </SelectItem>
                          <SelectItem value="person">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-success" />
                              Person
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Input
                        label="Account Name"
                        required
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter account name"
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Account Number"
                        value={formData.account_number || ''}
                        onChange={(e) => handleInputChange('account_number', e.target.value)}
                        placeholder="Enter account number"
                        icon={<Hash className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Tax ID / EIN"
                        value={formData.tax_id || ''}
                        onChange={(e) => handleInputChange('tax_id', e.target.value)}
                        placeholder="Enter tax ID or EIN"
                        icon={<Hash className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter account description"
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
                </div>
              )}
              
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        icon={<Mail className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        icon={<Phone className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Input
                        label="Website"
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="Enter website URL"
                        icon={<Globe className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter address"
                        rows={3}
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'additional' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Notes"
                        value={formData.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Enter additional notes"
                        rows={4}
                      />
                    </div>
                    
                    {formData.account_type === 'person' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          Link to Member
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
                            onChange={(value) => handleInputChange('member_id', value)}
                            placeholder="Select a member to link (optional)"
                          />
                        )}
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          Linking to a member will associate this account with their profile
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                onClick={() => navigate('/accounts')}
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountAddEdit;