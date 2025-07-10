import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui2/card';

function MenuManagement() {
  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Menu & Feature Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage global menu items and features.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MenuManagement;
