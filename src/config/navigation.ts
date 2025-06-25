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
  Wallet,
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
    name: 'Accounting',
    href: '/finances',
    icon: DollarSign,
    permission: 'finance.view',
    submenu: [
      {
        name: 'Overview',
        icon: BarChart3,
        submenu: [
          {
            name: 'Dashboard',
            href: '/finances',
            icon: BarChart3,
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
        name: 'Transactions',
        icon: History,
        submenu: [
          {
            name: 'Donations',
            href: '/finances/giving',
            icon: Heart,
          },
          {
            name: 'Expenses',
            href: '/finances/expenses',
            icon: CreditCard,
          },
          {
            name: 'Budgets',
            href: '/finances/budgets',
            icon: CreditCard,
          },
          {
            name: 'Funds',
            href: '/finances/funds',
            icon: Wallet,
          },
          {
            name: 'Journal Entries',
            href: '/finances/journal-entry',
            icon: FileText,
          },
        ],
      },
      {
        name: 'Accounts',
        icon: Building2,
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
    ],
  },
];
