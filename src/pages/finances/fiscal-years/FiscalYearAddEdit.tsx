import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFiscalYearRepository } from '../../../hooks/useFiscalYearRepository';
import { FiscalYear } from '../../../models/fiscalYear.model';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2, Save } from 'lucide-react';

function FiscalYearAddEdit() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { useFindById, useCreate, useUpdate } = useFiscalYearRepository();
  const [formData, setFormData] = useState<Partial<FiscalYear>>({});
  const { data, isLoading } = useFindById(id || '', { enabled: isEditMode });
  const createMutation = useCreate();
  const updateMutation = useUpdate();

  useEffect(() => {
    if (isEditMode && data?.data?.[0]) {
      setFormData(data.data[0]);
    }
  }, [isEditMode, data]);

  const handleChange = (field: keyof FiscalYear, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, data: formData });
      navigate(`/finances/fiscal-years/${id}`);
    } else {
      const result = await createMutation.mutateAsync({ data: formData });
      navigate(`/finances/fiscal-years/${result.id}`);
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
        <BackButton fallbackPath="/finances/fiscal-years" label="Back" />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">{isEditMode ? 'Edit Fiscal Year' : 'Add Fiscal Year'}</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
            <Input type="date" label="Start Date" value={formData.start_date || ''} onChange={e => handleChange('start_date', e.target.value)} />
            <Input type="date" label="End Date" value={formData.end_date || ''} onChange={e => handleChange('end_date', e.target.value)} />
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

export default FiscalYearAddEdit;
