import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui2/card';
import { useLicensePlanRepository } from '../../hooks/useLicensePlanRepository';
import type { LicensePlan } from '../../models/licensePlan.model';

function LicensePlanEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById, useCreate, useUpdate } = useLicensePlanRepository();
  const { data } = useFindById(id || '', { enabled: !!id });
  const [formData, setFormData] = useState<Partial<LicensePlan>>({});

  useEffect(() => {
    if (data?.data) {
      setFormData({ ...data.data });
    }
  }, [data]);

  const create = useCreate();
  const update = useUpdate();

  const handleChange = (field: keyof LicensePlan, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (id) {
      await update.mutateAsync({ id, data: formData });
    } else {
      await create.mutateAsync({ data: formData });
    }
    navigate('..');
  };

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Plan' : 'Add Plan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={formData.name || ''}
            onChange={e => handleChange('name', e.target.value)}
          />
          <Input
            label="Tier"
            value={formData.tier || ''}
            onChange={e => handleChange('tier', e.target.value)}
          />
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={e => handleChange('description', e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button onClick={() => navigate('..')} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LicensePlanEdit;
