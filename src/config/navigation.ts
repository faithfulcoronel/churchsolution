import {
  Home,
  Users,
  CalendarCheck,
  CalendarClock,
  HandCoins,
  PiggyBank,
  FileBarChart,
  LayoutDashboard,
  Bell,
  LifeBuoy,
  Shield,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  permission?: string | null;
  submenu?: NavItem[];
  section?: string;
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
    section: 'Community',
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: CalendarCheck,
    permission: 'member.view',
    section: 'Community',
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarClock,
    permission: 'member.view',
    section: 'Community',
  },
  {
    name: 'Financial Overview',
    href: '/finances',
    icon: LayoutDashboard,
    permission: 'finance.view',
    section: 'Financial',
  },
  {
    name: 'Tithes & Offerings',
    href: '/offerings',
    icon: HandCoins,
    permission: 'finance.view',
    section: 'Financial',
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: PiggyBank,
    permission: 'finance.view',
    section: 'Financial',
  },
  {
    name: 'Financial Reports',
    href: '/finances/financial-reports',
    icon: FileBarChart,
    permission: 'finance.view',
    section: 'Financial',
  },
  {
    name: 'Admin Panel',
    href: '/administration',
    icon: Shield,
    permission: 'user.view',
    section: 'Administration',
  },
];
