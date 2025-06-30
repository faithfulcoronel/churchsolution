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
  Tag,
  Shield,
  UserCog,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  permission?: string | null;
  submenu?: NavItem[];
  /**
   * When true the nav item is marked active only when the current path
   * exactly matches the item's href.
   */
  exact?: boolean;
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
            exact: true,
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
            name: 'Transactions',
            href: '/finances/transactions',
            icon: History,
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
            exact: true,
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
      {
        name: 'Configuration',
        icon: Tag,
        submenu: [
          {
            name: 'Donation Categories',
            href: '/finances/configuration/donation-categories',
            icon: Tag,
          },
          {
            name: 'Expense Categories',
            href: '/finances/configuration/expense-categories',
            icon: Tag,
          },
        ],
      },
    ],
  },
  {
    name: 'Administration',
    href: '/settings/administration',
    icon: Shield,
    permission: 'user.view',
    submenu: [
      {
        name: 'User Management',
        icon: UserCog,
        submenu: [
          {
            name: 'Users',
            href: '/settings/administration/users',
            icon: UserCog,
          },
          {
            name: 'Configuration',
            icon: Tag,
            submenu: [
              {
                name: 'Roles',
                href: '/settings/administration/roles',
                icon: Shield,
              },
              {
                name: 'Permissions',
                href: '/settings/administration/permissions',
                icon: Shield,
              },
            ],
          },
        ],
      },
    ],
  },
];
