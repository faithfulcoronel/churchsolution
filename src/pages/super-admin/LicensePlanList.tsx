import React from 'react';
import { Link } from 'react-router-dom';
import { useLicensePlanRepository } from '../../hooks/useLicensePlanRepository';
import { Button } from '../../components/ui2/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function LicensePlanList() {
  const { useQuery } = useLicensePlanRepository();
  const { data } = useQuery();
  const plans = data?.data || [];

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>License Plans</CardTitle>
          <Button asChild>
            <Link to="add">Add Plan</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {plans.map(p => (
              <li key={p.id} className="py-2 flex justify-between">
                <span>{p.name}</span>
                <Link to={`${p.id}/edit`} className="text-primary underline">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default LicensePlanList;
