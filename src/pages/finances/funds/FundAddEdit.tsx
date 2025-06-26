import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFundRepository } from '../../../hooks/useFundRepository';
import { Fund, FundType } from '../../../models/fund.model';
import { Card, CardHeader, CardContent } from '../../../components/ui2/card';
import { Input } from '../../../components/ui2/input';
import { Textarea } from '../../../components/ui2/textarea';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui2/select';

import { Save, Loader2, AlertCircle } from 'lucide-react';

function FundAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { useQuery: useFundQuery, useCreate, useUpdate } = useFundRepository();

  const [formData, setFormData] = useState<Partial<Fund>>({
    name: '',
    description: '',
    type: 'unrestricted',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: fundData, isLoading: isFundLoading } = useFundQuery({
    filters: { id: { operator: 'eq', value: id } },
    enabled: isEditMode,
  });

  const createMutation = useCreate();
  const updateMutation = useUpdate();

  useEffect(() => {
    if (isEditMode && fundData?.data?.[0]) {
      setFormData(fundData.data[0]);
    }
  }, [isEditMode, fundData]);

  const handleInputChange = (field: keyof Fund, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError('Fund name is required');
      return;
    }


    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: formData });
        navigate(`/finances/funds/${id}`);
      } else {
        const result = await createMutation.mutateAsync({ data: formData });
        navigate(`/finances/funds/${result.id}`);
      }
    } catch (err) {
      console.error('Error saving fund:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isEditMode && isFundLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/funds" label="Back to Funds" />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-foreground">
            {isEditMode ? 'Edit Fund' : 'Add New Fund'}
          </h3>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Fund Name"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter fund name"
                />
              </div>

              <div className="sm:col-span-2">
                <Select
                  value={formData.type || 'unrestricted'}
                  onValueChange={(value) => handleInputChange('type', value as FundType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Fund Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unrestricted">Unrestricted</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  placeholder="Enter fund description (optional)"
                />
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
              <Button type="button" variant="outline" onClick={() => navigate('/finances/funds')}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update Fund' : 'Create Fund'}
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

export default FundAddEdit;
