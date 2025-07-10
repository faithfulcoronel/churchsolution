import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function SuperAdminWelcome() {
  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome Super Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the navigation to manage tenants, license plans and menus.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuperAdminWelcome;

