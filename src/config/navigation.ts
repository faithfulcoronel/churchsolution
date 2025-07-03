import {
  Home,
  Users,
  DollarSign,
  Shield,
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
   * Optional group/section label used for organizing the sidebar.
   * Only required for top level navigation items.
   */
  section?: string;
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
    section: 'General',
  },
  {
    name: 'Announcements',
    href: '/announcements',
    icon: Bell,
    permission: null,
    section: 'General',
  },
  {
    name: 'Support',
    href: '/support',
    icon: LifeBuoy,
    permission: null,
    section: 'General',
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    permission: 'member.view',
    section: 'Management',
  },
  {
    name: 'Finance',
    href: '/finances',
    icon: DollarSign,
    permission: 'finance.view',
    section: 'Management',
  },
  {
    name: 'Admin Panel',
    href: '/administration',
    icon: Shield,
    permission: 'user.view',
    section: 'Administration',
  },
];
