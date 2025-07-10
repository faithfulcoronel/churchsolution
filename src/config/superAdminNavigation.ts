import {
  Home,
  LayoutDashboard,
  Building2,
  BadgeCheck,
  ListChecks,
} from 'lucide-react';
import type { NavItem } from './navigation';

export const superAdminNavigation: NavItem[] = [
  {
    name: 'Welcome',
    href: '/admin-panel/welcome',
    icon: Home,
    permission: null,
    section: 'General',
  },
  {
    name: 'Dashboard',
    href: '/admin-panel/dashboard',
    icon: LayoutDashboard,
    permission: null,
    section: 'General',
  },
  {
    name: 'Tenants',
    href: '/admin-panel/tenants',
    icon: Building2,
    permission: null,
    section: 'Management',
  },
  {
    name: 'License Plans',
    href: '/admin-panel/license-plans',
    icon: BadgeCheck,
    permission: null,
    section: 'Management',
  },
  {
    name: 'Menus',
    href: '/admin-panel/menus',
    icon: ListChecks,
    permission: null,
    section: 'Management',
  },
];

