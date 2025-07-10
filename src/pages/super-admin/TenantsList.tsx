import React from 'react';
import { Link } from 'react-router-dom';
import { useTenantRepository } from '../../hooks/useTenantRepository';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function TenantsList() {
  const { useQuery } = useTenantRepository();
  const { data } = useQuery();
  const tenants = data?.data || [];

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {tenants.map(t => (
              <li key={t.id} className="py-2">
                <Link to={t.id}>{t.name}</Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default TenantsList;
