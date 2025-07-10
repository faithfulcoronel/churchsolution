import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function SuperAdminDashboard() {
  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Super Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Summary of system metrics will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuperAdminDashboard;
