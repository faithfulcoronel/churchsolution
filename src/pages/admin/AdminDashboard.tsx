import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantUtils } from '../../utils/tenantUtils';
import { useAccess } from '../../utils/access';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui2/card';
import {
  Users,
  ListChecks,
  UserCog,
  BadgeCheck,
  FileText,
  Settings,
  Shield,
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem } from '../../components/ui2/breadcrumb';

interface FeatureCard {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  permission: string;
  feature: string;
}

function AdminDashboard() {
  const { data: tenant } = useQuery({
    queryKey: ['current-tenant-info'],
    queryFn: () => tenantUtils.getCurrentTenant(),
  });
  const { hasAccess } = useAccess();

  const cards: FeatureCard[] = [
    {
      key: 'roles',
      title: 'Manage Roles',
      description: 'Create and assign permissions to roles',
      icon: Shield,
      href: '/admin/roles',
      permission: 'role.view',
      feature: 'admin.custom-roles',
    },
    {
      key: 'menus',
      title: 'Menu Access Control',
      description: 'Control navigation visibility by role',
      icon: ListChecks,
      href: '/admin/roles',
      permission: 'role.edit',
      feature: 'admin.custom-roles',
    },
    {
      key: 'user-roles',
      title: 'Assign User Roles',
      description: 'Manage role assignments for users',
      icon: UserCog,
      href: '/admin/users',
      permission: 'user.edit',
      feature: 'admin.custom-roles',
    },
    {
      key: 'license',
      title: 'License Management',
      description: 'View and update tenant license',
      icon: BadgeCheck,
      href: '/admin/license',
      permission: 'user.view',
      feature: 'admin.custom-roles',
    },
    {
      key: 'audit',
      title: 'Audit Logs',
      description: 'Review system activity and changes',
      icon: FileText,
      href: '/admin/audit-logs',
      permission: 'user.view',
      feature: 'admin.audit-logs',
    },
    {
      key: 'settings',
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      href: '/settings',
      permission: 'user.view',
      feature: 'admin.custom-roles',
    },
  ];

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem active>Admin Dashboard</BreadcrumbItem>
      </Breadcrumb>
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome Admin{tenant ? ` of ${tenant.name}` : ''}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map(card =>
          hasAccess(card.permission, card.feature) ? (
            <Link key={card.key} to={card.href} className="group">
              <Card className="rounded-2xl bg-white dark:bg-gray-900 shadow-md hover:ring-2 p-6">
                <CardHeader className="p-0 mb-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
