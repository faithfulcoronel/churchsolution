import React from 'react';
import { useParams } from 'react-router-dom';
import { useTenantRepository } from '../../hooks/useTenantRepository';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function TenantProfile() {
  const { id } = useParams<{ id: string }>();
  const { useFindById } = useTenantRepository();
  const { data } = useFindById(id || '');
  const tenant = data?.data;

  if (!tenant) {
    return null;
  }

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>{tenant.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Subdomain: {tenant.subdomain}</p>
          <p>Status: {tenant.status}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TenantProfile;
