import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournalEntry, JournalEntryLine } from '../../hooks/useJournalEntry';
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { DatePickerInput } from '../../components/ui2/date-picker';
import { Textarea } from '../../components/ui2/textarea';
import { Select } from '../../components/ui2/select';
import { Badge } from '../../components/ui2/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  DollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useCurrencyStore } from '../../stores/currencyStore';
import { formatCurrency } from '../../utils/currency';

function JournalEntryForm() {
  const navigate = navigate();
  const { currency } = useCurrencyStore();
  const { useCreateJournalEntry } = useJournalEntry();
  const { useAccountOptions } = useChartOfAccounts();
  
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [entries, setEntries] = useState<JournalEntryLine[]>([
    { account_id: '', debit: undefined, credit: undefined, description: '' },
    { account_id: '', debit: undefined, credit: undefined, description: '' }
  ]);
  
  // Validation state
  const [errors, setErrors] = useState<{
    date?: string;
    description?: string;
    entries?: string;
    balance?: string;
  }>({});
  
  // Get account options
  const { data: accountOptions, isLoading: isLoadingAccounts } = useAccountOptions();
  
  // Create journal entry mutation
  const createJournalEntry = useCreateJournalEntry();
  
  // Calculate totals
  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  
  // Add entry row
  const addEntry = () => {
    setEntries([...entries, { account_id: '', debit: undefined, credit: undefined, description: '' }]);
  };
  
  // Remove entry row
  const removeEntry = (index: number) => {
    if (entries.length <= 2) {
      return; // Keep at least 2 entries
    }
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };
  
  // Update entry
  const updateEntry = (index: number, field: keyof JournalEntryLine, value: any) => {
    const newEntries = [...entries];
    
    // If updating debit/credit, ensure only one has a value
    if (field === 'debit' && value) {
      newEntries[index] = { 
        ...newEntries[index], 
        [field]: parseFloat(value) || 0,
        credit: undefined 
      };
    } else if (field === 'credit' && value) {
      newEntries[index] = { 
        ...newEntries[index], 
        [field]: parseFloat(value) || 0,
        debit: undefined 
      };
    } else {
      newEntries[index] = { ...newEntries[index], [field]: value };
    }
    
    setEntries(newEntries);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      date?: string;
      description?: string;
      entries?: string;
      balance?: string;
    } = {};
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Check if all entries have an account and either debit or credit
    const invalidEntries = entries.filter(entry => 
      !entry.account_id || 
      ((!entry.debit || entry.debit === 0) && (!entry.credit || entry.credit === 0))
    );
    
    if (invalidEntries.length > 0) {
      newErrors.entries = 'All entries must have an account and either debit or credit amount';
    }
    
    // Check if debits equal credits
    if (!isBalanced) {
      newErrors.balance = 'Total debits must equal total credits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createJournalEntry.mutateAsync({
        date: date.toISOString().split('T')[0],
        description,
        reference: reference || undefined,
        entries: entries.filter(entry => entry.account_id && (entry.debit || entry.credit))
      });
      
      navigate('/finances/transactions');
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/finances/transactions')}
          className="flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Transactions
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-medium">Create Journal Entry</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <DatePickerInput
                  label="Date"
                  value={date}
                  onChange={(date) => date && setDate(date)}
                  error={errors.date}
                  icon={<Calendar className="h-4 w-4" />}
                  required
                />
              </div>
              
              <div>
                <Input
                  label="Reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional reference number or code"
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this journal entry"
                  error={errors.description}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Journal Entry Lines</h4>
              
              {errors.entries && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {errors.entries}
                  </p>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {entries.map((entry, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          {isLoadingAccounts ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading accounts...
                            </div>
                          ) : (
                            <Select
                              value={entry.account_id}
                              onValueChange={(value) => updateEntry(index, 'account_id', value)}
                              options={accountOptions?.map(opt => ({
                                value: opt.value,
                                label: opt.label
                              })) || []}
                              placeholder="Select account"
                              required
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={entry.description || ''}
                            onChange={(e) => updateEntry(index, 'description', e.target.value)}
                            placeholder="Description (optional)"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={entry.debit !== undefined ? entry.debit : ''}
                            onChange={(e) => updateEntry(index, 'debit', e.target.value)}
                            placeholder="0.00"
                            className="text-right"
                            icon={<DollarSign className="h-4 w-4" />}
                            disabled={entry.credit !== undefined && entry.credit > 0}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={entry.credit !== undefined ? entry.credit : ''}
                            onChange={(e) => updateEntry(index, 'credit', e.target.value)}
                            placeholder="0.00"
                            className="text-right"
                            icon={<DollarSign className="h-4 w-4" />}
                            disabled={entry.debit !== undefined && entry.debit > 0}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(index)}
                            disabled={entries.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/20">
                      <td colSpan={2} className="px-4 py-3 text-right font-medium">
                        Totals
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(totalDebits, currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(totalCredits, currency)}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addEntry}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Line
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  {isBalanced ? (
                    <Badge variant="success" className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Balanced
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Unbalanced: {formatCurrency(Math.abs(totalDebits - totalCredits), currency)}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {entries.length} line items
                </div>
              </div>
              
              {errors.balance && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {errors.balance}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/finances/transactions')}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={createJournalEntry.isPending || !isBalanced}
            >
              {createJournalEntry.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Journal Entry
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default JournalEntryForm;