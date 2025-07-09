import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpeningBalanceRepository } from '../../../hooks/useOpeningBalanceRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2 } from 'lucide-react';

function OpeningBalanceProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById } = useOpeningBalanceRepository();
  const { data, isLoading } = useFindById(id || '');
  const balance = data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardContent className="p-6">Balance not found</CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/finances/opening-balances" label="Back" />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Opening Balance Details</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Fiscal Year:</strong> {balance.fiscal_year?.name}</p>
          <p><strong>Fund:</strong> {balance.fund?.code} - {balance.fund?.name}</p>
          <p><strong>Amount:</strong> {balance.amount}</p>
          <p><strong>Status:</strong> {balance.status}</p>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate('edit')}>Edit</Button>
      </div>
    </div>
  );
}

export default OpeningBalanceProfile;
