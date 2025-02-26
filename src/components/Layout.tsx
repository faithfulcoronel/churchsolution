import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGate from './PermissionGate';
import ChurchBranding from './ChurchBranding';
import Footer from './Footer';
import { Container } from './ui/Container';
import { Button } from './ui/Button';
import { Menu, MenuItem, MenuHeader, MenuDivider } from './ui/Menu';
import { Dropdown } from './ui/Dropdown';
import { Badge } from './ui/Badge';
import {
  Home,
  Users,
  DollarSign,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
  ChevronDown,
  Shield,
  UserCog,
  Database,
  Building2,
  Crown,
  Sparkles,
} from 'lucide-react';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hasPermission, isAdmin } = usePermissions();

  // Get current tenant subscription
  const { data: tenant } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_current_tenant');

      if (error) throw error;
      return data?.[0];
    },
  });

  // Get associated member data
  const { data: memberData } = useQuery({
    queryKey: ['current-user-member', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;

      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, profile_picture_url')
        .eq('email', user.email)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching member data:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      permission: null 
    },
    { 
      name: 'Members', 
      href: '/members', 
      icon: Users,
      permission: 'member.view' 
    },
    { 
      name: 'Finances', 
      href: '/finances', 
      icon: DollarSign,
      permission: 'finance.view' 
    },
  ];

  const adminNavigation = [
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserCog,
      permission: 'user.view'
    },
    {
      name: 'Roles',
      href: '/admin/roles',
      icon: Shield,
      permission: 'role.view'
    },
    {
      name: 'Church Settings',
      href: '/admin/settings',
      icon: Building2,
      permission: null
    }
  ];

  // Check if any admin menu items are accessible
  const hasAdminAccess = adminNavigation.some(item => 
    !item.permission || hasPermission(item.permission) || isAdmin()
  );

  const renderNavLink = (item: typeof navigation[0]) => (
    <PermissionGate
      key={item.name}
      permission={item.permission}
    >
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`
          group flex items-center rounded-lg px-3 py-2 text-sm font-medium
          transition-colors duration-200
          ${location.pathname.startsWith(item.href)
            ? 'bg-primary text-white dark:bg-primary dark:text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }
        `}
      >
        {React.createElement(item.icon, {
          className: `mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
            location.pathname.startsWith(item.href)
              ? 'text-white'
              : 'text-gray-400 group-hover:text-white'
          }`,
        })}
        {item.name}
      </Link>
    </PermissionGate>
  );

  const renderSubscribeButton = () => (
    <Link to="/settings/subscription" className="px-4">
      <div className={`
        relative overflow-hidden
        rounded-xl
        ${tenant?.subscription_tier === 'free'
          ? 'bg-gradient-to-r from-primary-600 to-primary-400'
          : 'bg-gradient-to-r from-primary-700 to-primary-500'
        }
        group
        transition-all duration-300
        hover:shadow-lg
        transform hover:-translate-y-1
      `}>
        <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
        
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className={`
              h-5 w-5 text-white
              ${tenant?.subscription_tier === 'free' ? 'animate-bounce' : ''}
            `} />
            <div>
              <p className="text-white font-medium">
                {tenant?.subscription_tier === 'free' ? 'Subscribe Now' : 'Upgrade Plan'}
              </p>
              <p className="text-xs text-white/80">
                {tenant?.subscription_tier === 'free'
                  ? 'Unlock premium features'
                  : 'Explore more features'
                }
              </p>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-white opacity-75 group-hover:opacity-100" />
        </div>

        {/* Animated border */}
        <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />
        
        {tenant?.subscription_tier === 'free' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-shimmer" />
        )}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-gray-800">
            <ChurchBranding />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map(renderNavLink)}

              {/* Admin Section */}
              {hasAdminAccess && (
                <div className="relative">
                  <div
                    className="relative mt-6 flex items-center px-2"
                    aria-hidden="true"
                  >
                    <div className="flex-grow border-t border-gray-800" />
                    <span className="mx-2 flex items-center text-sm font-medium text-gray-400">
                      Admin
                    </span>
                    <div className="flex-grow border-t border-gray-800" />
                  </div>

                  {adminNavigation.map(renderNavLink)}
                </div>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="flex-shrink-0 border-t border-gray-800 p-4 space-y-4">
              {/* Subscribe Button */}
              {renderSubscribeButton()}

              {/* Settings Link */}
              <Link
                to="/settings"
                className={`
                  group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${location.pathname.startsWith('/settings')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <SettingsIcon className={`
                  mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200
                  ${location.pathname.startsWith('/settings')
                    ? 'text-white rotate-90'
                    : 'text-gray-400 group-hover:text-white group-hover:rotate-90'
                  }
                `} />
                <span className="flex-1">Settings</span>
                {tenant?.subscription_tier === 'free' && (
                  <Badge variant="primary" size="sm">
                    Free
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
          <div className="flex h-16 items-center px-4 bg-gray-800">
            <ChurchBranding />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map(renderNavLink)}

              {/* Admin Section */}
              {hasAdminAccess && (
                <div className="relative">
                  <div
                    className="relative mt-6 flex items-center px-2"
                    aria-hidden="true"
                  >
                    <div className="flex-grow border-t border-gray-800" />
                    <span className="mx-2 flex items-center text-sm font-medium text-gray-400">
                      Admin
                    </span>
                    <div className="flex-grow border-t border-gray-800" />
                  </div>

                  {adminNavigation.map(renderNavLink)}
                </div>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="flex-shrink-0 border-t border-gray-800 p-4 space-y-4">
              {/* Subscribe Button */}
              {renderSubscribeButton()}

              {/* Settings Link */}
              <Link
                to="/settings"
                className={`
                  group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium
                  transition-all duration-200 ease-in-out
                  ${location.pathname.startsWith('/settings')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <SettingsIcon className={`
                  mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200
                  ${location.pathname.startsWith('/settings')
                    ? 'text-white rotate-90'
                    : 'text-gray-400 group-hover:text-white group-hover:rotate-90'
                  }
                `} />
                <span className="flex-1">Settings</span>
                {tenant?.subscription_tier === 'free' && (
                  <Badge variant="primary" size="sm">
                    Free
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow dark:shadow-none border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="border-r border-gray-200 dark:border-gray-700 px-6 py-8 text-gray-500 dark:text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 justify-end px-4">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <Dropdown
                trigger={
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center gap-2">
                      {memberData?.profile_picture_url ? (
                        <img
                          src={memberData.profile_picture_url}
                          alt={`${memberData.first_name} ${memberData.last_name}`}
                          className="h-8 w-8 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-light dark:bg-primary-light flex items-center justify-center">
                          <span className="text-primary dark:text-primary font-medium">
                            {memberData ? memberData.first_name[0] : user.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="hidden md:flex md:items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {memberData ? `${memberData.first_name} ${memberData.last_name}` : user.email}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </button>
                }
                align="right"
                width="sm"
              >
                <Menu>
                  <MenuHeader>Account</MenuHeader>
                  {memberData && (
                    <MenuItem
                      icon={<Users />}
                      onClick={() => navigate(`/members/${memberData.id}`)}
                    >
                      View Profile
                    </MenuItem>
                  )}
                  <MenuItem
                    icon={<SettingsIcon />}
                    onClick={() => navigate('/settings')}
                    description="Account preferences and settings"
                  >
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    icon={<LogOut />}
                    onClick={() => useAuthStore.getState().signOut()}
                    destructive
                  >
                    Sign out
                  </MenuItem>
                </Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <Container className="py-6">
            <Outlet />
          </Container>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;