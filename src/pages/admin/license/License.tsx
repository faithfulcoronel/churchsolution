import React, { useEffect, useState } from 'react';
import { useLicenseRepository } from '../../../hooks/useLicenseRepository';
import { useLicenseFeatureRepository } from '../../../hooks/useLicenseFeatureRepository';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Button } from '../../../components/ui2/button';
import { Loader2 } from 'lucide-react';
import { License } from '../../../models/license.model';

function LicensePage() {
  const { useQuery, useCreate, useUpdate } = useLicenseRepository();
  const { useQuery: useFeatureQuery } = useLicenseFeatureRepository();

  const { data: licenseRes, isLoading } = useQuery();
  const license = licenseRes?.data?.[0] as License | undefined;

  const { data: featureRes } = useFeatureQuery(
    license
      ? { filters: { plan_name: { operator: 'eq', value: license.plan_name } } }
      : { enabled: false }
  );

  const features = featureRes?.data || [];

  const [formData, setFormData] = useState<Partial<License>>({});

  useEffect(() => {
    if (license) {
      setFormData({ ...license });
    }
  }, [license]);

  const createMutation = useCreate();
  const updateMutation = useUpdate();

  const handleChange = (field: keyof License, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (license) {
      await updateMutation.mutateAsync({ id: license.id, data: formData });
    } else {
      await createMutation.mutateAsync({ data: formData });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Current License</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Plan Name"
            value={formData.plan_name || ''}
            onChange={e => handleChange('plan_name', e.target.value)}
          />
          <Input
            label="Tier"
            value={formData.tier || ''}
            onChange={e => handleChange('tier', e.target.value)}
          />
          <Input
            label="Status"
            value={formData.status || ''}
            onChange={e => handleChange('status', e.target.value)}
          />
          <Input
            type="date"
            label="Starts At"
            value={formData.starts_at || ''}
            onChange={e => handleChange('starts_at', e.target.value)}
          />
          <Input
            type="date"
            label="Expires At"
            value={formData.expires_at || ''}
            onChange={e => handleChange('expires_at', e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Active Features</h3>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <p className="text-muted-foreground">No features enabled</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {features.map(f => (
                <li key={f.id}>{f.feature}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LicensePage;
