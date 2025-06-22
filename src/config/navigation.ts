import {
  Home,
  Users,
  DollarSign,
  Building2,
  Heart,
  BarChart3,
  FileText,
  CreditCard,
  History,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  permission?: string | null;
  submenu?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    icon: Home,
    permission: null,
    submenu: [
      {
        name: 'Church Overview',
        href: '/dashboard/church',
        icon: Building2,
      },
      {
        name: 'Personal Overview',
        href: '/dashboard/personal',
        icon: Users,
      },
    ],
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    permission: 'member.view',
    submenu: [
      {
        name: 'Member List',
        href: '/members/list',
        icon: Users,
      },
      {
        name: 'Family Relationships',
        href: '/members/family',
        icon: Heart,
      },
    ],
  },
  {
    name: 'Finances',
    href: '/finances',
    icon: DollarSign,
    permission: 'finance.view',
    submenu: [
      {
        name: 'Overview',
        href: '/finances',
        icon: BarChart3,
      },
      {
        name: 'Transactions',
        href: '/finances/transactions',
        icon: History,
      },
      {
        name: 'Budgets',
        href: '/finances/budgets',
        icon: CreditCard,
      },
      {
        name: 'Reports',
        href: '/finances/reports',
        icon: FileText,
      },
      {
        name: 'Statements',
        href: '/finances/statements',
        icon: FileText,
      },
    ],
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: Building2,
    permission: 'finance.view',
    submenu: [
      {
        name: 'Accounts',
        href: '/accounts',
        icon: Building2,
      },
      {
        name: 'Financial Sources',
        href: '/accounts/sources',
        icon: CreditCard,
      },
      {
        name: 'Chart of Accounts',
        href: '/accounts/chart-of-accounts',
        icon: FileText,
      },
    ],
  },
];
