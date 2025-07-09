import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOpeningBalanceRepository } from '../../../hooks/useOpeningBalanceRepository';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { useFiscalYearRepository } from '../../../hooks/useFiscalYearRepository';
import { OpeningBalance } from '../../../models/openingBalance.model';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui2/select';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2, Save } from 'lucide-react';

function OpeningBalanceAddEdit() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { useFindById, useCreate, useUpdate } = useOpeningBalanceRepository();
  const { useQuery: useFundQuery } = useFundRepository();
  const { useQuery: useYearQuery } = useFiscalYearRepository();

  const [formData, setFormData] = useState<Partial<OpeningBalance>>({ amount: 0 });
  const { data: balanceData, isLoading } = useFindById(id || '', { enabled: isEditMode });
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const { data: funds } = useFundQuery();
  const { data: years } = useYearQuery();

  useEffect(() => {
    if (isEditMode && balanceData) {
      setFormData(balanceData);
    }
  }, [isEditMode, balanceData]);

  const handleChange = (field: keyof OpeningBalance, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate(`/finances/opening-balances/${id}`);
    } else {
      const result = await createMutation.mutateAsync({ data: formData });
      navigate(`/finances/opening-balances/${result.id}`);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/opening-balances" label="Back" />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">{isEditMode ? 'Edit Opening Balance' : 'Add Opening Balance'}</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={formData.fiscal_year_id || ''} onValueChange={v => handleChange('fiscal_year_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                {(years?.data || []).map(y => (
                  <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.fund_id || ''} onValueChange={v => handleChange('fund_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Fund" />
              </SelectTrigger>
              <SelectContent>
                {(funds?.data || []).map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.code} - {f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" value={formData.amount ?? 0} onChange={e => handleChange('amount', parseFloat(e.target.value))} label="Amount" />
            <div className="flex justify-end">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpeningBalanceAddEdit;
