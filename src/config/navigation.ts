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
  Upload,
  Shield,
  UserCog,
  Bell,
  LifeBuoy,
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
    name: 'Welcome',
    href: '/welcome',
    icon: Home,
    permission: null,
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Bell,
    permission: null,
  },
  {
    name: 'Support',
    href: '/support',
    icon: LifeBuoy,
    permission: null,
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
      {
        name: 'Member Settings',
        icon: Tag,
        submenu: [
          {
            name: 'Membership Types',
            href: '/members/configuration/membership-types',
            icon: Tag,
          },
          {
            name: 'Membership Status',
            href: '/members/configuration/membership-status',
            icon: Tag,
          },
          {
            name: 'Relationship Types',
            href: '/members/configuration/relationship-types',
            icon: Tag,
          },
        ],
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
            name: 'Finance Dashboard',
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
        name: 'Transaction Center',
        icon: History,
        submenu: [
          {
            name: 'Donations',
            href: '/finances/giving',
            icon: Heart,
          },
          {
            name: 'Import Weekly Giving',
            href: '/finances/giving/import',
            icon: Upload,
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
            name: 'All Transactions',
            href: '/finances/transactions',
            icon: History,
          },
        ],
      },
      {
        name: 'Financial Accounts',
        icon: Building2,
        submenu: [
          {
            name: 'Account List',
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
        name: 'Finance Settings',
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
          {
            name: 'Budget Categories',
            href: '/finances/configuration/budget-categories',
            icon: Tag,
          },
        ],
      },
    ],
  },
  {
    name: 'Administration',
    href: '/administration',
    icon: Shield,
    permission: 'user.view',
    submenu: [
      {
        name: 'User Management',
        icon: UserCog,
        submenu: [
          {
            name: 'Users',
            href: '/administration/users',
            icon: UserCog,
          },
          {
            name: 'User Settings',
            icon: Tag,
            submenu: [
              {
                name: 'Roles',
                href: '/administration/roles',
                icon: Shield,
              },
              {
                name: 'Permissions',
                href: '/administration/permissions',
                icon: Shield,
              },
            ],
          },
        ],
      },
      {
        name: 'Account Management',
        icon: Building2,
        submenu: [
          {
            name: 'Church Settings',
            href: '/administration/account-management/church',
            icon: Building2,
          },
        ],
      },
    ],
  },
];
