import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiscalYearRepository } from '../../../hooks/useFiscalYearRepository';
import { useFiscalPeriodRepository } from '../../../hooks/useFiscalPeriodRepository';
import { Card, CardContent, CardHeader } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import BackButton from '../../../components/BackButton';
import { Loader2 } from 'lucide-react';

function FiscalYearProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useFindById } = useFiscalYearRepository();
  const { useQuery: usePeriodsQuery } = useFiscalPeriodRepository();

  const { data, isLoading } = useFindById(id || '');
  const {
    data: periodsResult,
    isLoading: periodsLoading
  } = usePeriodsQuery({
    filters: { fiscal_year_id: { operator: 'eq', value: id } },
    order: { column: 'start_date', ascending: true },
    enabled: !!id
  });
  const periods = periodsResult?.data || [];
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
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-lg font-medium">Fiscal Periods</h3>
        </CardHeader>
        <CardContent className="p-0">
          {periodsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : periods.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No fiscal periods found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {periods.map(period => (
                    <tr key={period.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{period.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{period.start_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{period.end_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">{period.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate('edit')}>Edit</Button>
      </div>
    </div>
  );
}

export default FiscalYearProfile;
