import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiscalYearRepository } from '../../../hooks/useFiscalYearRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2 } from 'lucide-react';

function FiscalYearProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById } = useFiscalYearRepository();
  const { data, isLoading } = useFindById(id || '');
  const year = data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!year) {
    return (
      <Card>
        <CardContent className="p-6">Fiscal year not found</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/fiscal-years" label="Back" />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Fiscal Year Details</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {year.name}</p>
          <p><strong>Start Date:</strong> {year.start_date}</p>
          <p><strong>End Date:</strong> {year.end_date}</p>
          <p><strong>Status:</strong> {year.status}</p>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate('edit')}>Edit</Button>
      </div>
    </div>
  );
}

export default FiscalYearProfile;
