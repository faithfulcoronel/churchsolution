import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import { Scrollable } from '../ui2/scrollable';
import { Input } from '../ui2/input';
import { Button } from '../ui2/button';
import { Badge } from '../ui2/badge';
import { Separator } from '../ui2/separator';
import {
  Settings as SettingsIcon,
  Crown,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { navigation as baseNavigation, NavItem } from '../../config/navigation';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
  pinned,
  setPinned,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Collapse sidebar when unpinned
  React.useEffect(() => {
    if (pinned) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [pinned, setCollapsed]);

  // Get current tenant
  const { data: tenant } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const navigation = useMemo(
    () =>
      baseNavigation.filter(
        (item) => !item.permission || hasPermission(item.permission)
      ),
    [hasPermission]
  );

  const renderItem = (item: NavItem, level = 0) => {
    const hasChildren = item.submenu && item.submenu.length > 0;
    const padding = collapsed
      ? 'px-3'
      : level === 0
        ? 'px-3'
        : level === 1
          ? 'pl-11 pr-3'
          : 'pl-16 pr-3';

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            title={collapsed ? item.name : undefined}
            className={`
              w-full group flex items-center justify-between rounded-lg ${padding} py-2 text-sm font-medium
              transition-colors duration-200 ${collapsed ? 'justify-center' : ''}
              ${isNavItemActive(item)
                ? 'bg-primary text-white'
                : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                ? 'bg-primary/20 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <div className="flex items-center">
              <item.icon
                className={`h-5 w-5 flex-shrink-0 transition-colors ${isNavItemActive(item) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
              />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isSubmenuOpen(item.name) ? 'rotate-180' : ''}`}
              />
            )}
          </button>
          {!collapsed && (
            <div
              className={`mt-1 space-y-1 transition-all duration-200 ${isSubmenuOpen(item.name) ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}
            >
              {item.submenu!.map((sub) => renderItem(sub, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href || ''}
        title={collapsed ? item.name : undefined}
        className={`
          group flex items-center rounded-lg ${padding} py-2 text-sm font-medium
          transition-colors duration-200 ${collapsed ? 'justify-center' : ''}
          ${isNavItemActive(item)
            ? 'bg-primary text-white'
            : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ? 'bg-primary/20 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
        `}
      >
        <item.icon
          className={`h-5 w-5 flex-shrink-0 transition-colors ${isNavItemActive(item) ? 'text-white' : 'text-gray-400 group-hover:text-white'} ${collapsed ? '' : 'mr-3'}`}
        />
        {!collapsed && item.name}
      </Link>
    );
  };

  // Recursively filter navigation items based on search term
  const filteredNavigation = useMemo(() => {
    if (!searchTerm) return navigation;

    const searchLower = searchTerm.toLowerCase();

    const filterItems = (items: NavItem[]): NavItem[] =>
      items
        .map((item) => {
          const matches = item.name.toLowerCase().includes(searchLower);
          const children = item.submenu ? filterItems(item.submenu) : undefined;

          if (matches || (children && children.length > 0)) {
            return { ...item, submenu: children };
          }
          return matches ? { ...item, submenu: children } : null;
        })
        .filter((item): item is NavItem => item !== null);

    return filterItems(navigation);
  }, [navigation, searchTerm]);

  // Handle submenu toggle
  const toggleSubmenu = (itemName: string) => {
    if (collapsed) return;
    setOpenSubmenus((prev) => {
      const newOpenSubmenus = new Set(prev);
      if (newOpenSubmenus.has(itemName)) {
        newOpenSubmenus.delete(itemName);
      } else {
        newOpenSubmenus.add(itemName);
      }
      return newOpenSubmenus;
    });
  };

  // Auto-expand submenus when searching
  const areSetsEqual = (a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  };

  React.useEffect(() => {
    if (searchTerm && !collapsed) {
      const names = new Set<string>();

      const collect = (items: NavItem[]) => {
        items.forEach((item) => {
          if (item.submenu && item.submenu.length > 0) {
            names.add(item.name);
            collect(item.submenu);
          }
        });
      };

      collect(filteredNavigation);
      setOpenSubmenus((prev) => {
        if (areSetsEqual(prev, names)) return prev;
        return names;
      });
    }
  }, [searchTerm, filteredNavigation]);

  React.useEffect(() => {
    if (collapsed) {
      setOpenSubmenus(new Set());
    }
  }, [collapsed]);

  // Check if a submenu is open
  const isSubmenuOpen = (itemName: string) => {
    if (collapsed) return false;
    return openSubmenus.has(itemName);
  };

  const isNavItemActive = React.useCallback(
    (item: NavItem): boolean => {
      if (item.href) {
        if (item.exact) {
          return location.pathname === item.href;
        }
        if (location.pathname === item.href) return true;
        return location.pathname.startsWith(`${item.href}/`);
      }
      if (item.submenu) {
        return item.submenu.some((sub) => isNavItemActive(sub));
      }
      return false;
    },
    [location.pathname]
  );

  // Auto-expand submenu based on current path
  React.useEffect(() => {
    const activeNames = new Set<string>();

    const collectActive = (items: NavItem[], parents: string[] = []) => {
      items.forEach((item) => {
        if (isNavItemActive(item)) {
          parents.forEach((p) => activeNames.add(p));
        }
        if (item.submenu) {
          collectActive(item.submenu, [...parents, item.name]);
        }
      });
    };

    collectActive(navigation);

    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      activeNames.forEach((name) => newSet.add(name));
      if (areSetsEqual(prev, newSet)) return prev;
      return newSet;
    });
  }, [location.pathname, navigation]);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden
          transition-opacity duration-300
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-gray-900 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-64 ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          transition-all
        `}
        onMouseEnter={() => {
          if (!pinned) {
            setCollapsed(false);
          }
        }}
        onMouseLeave={() => {
          if (!pinned) {
            setCollapsed(true);
          }
        }}
      >
        <div className="flex flex-col h-full px-2">
          {/* Logo and controls */}
          <div className="flex-shrink-0 h-16 flex items-center justify-between px-4">
            <img
              src={collapsed ? '/logo_square.svg' : '/logo_long.svg'}
              alt="StewardTrack Logo"
              className="h-8"
            />
            <div className="hidden lg:flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPinned(!pinned)}
                title={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {pinned ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {!collapsed && (
            <div className="px-2 py-4">
              <Input
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          {!collapsed && <Separator className="bg-gray-800" />}

          {/* Navigation - Scrollable Area */}
          <Scrollable className={`flex-1 ${collapsed ? 'py-2' : 'py-4'}`} shadow={false}>
            <nav className="space-y-1">
              {filteredNavigation.map((item) => renderItem(item))}

              {/* No results message */}
              {filteredNavigation.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No menu items found
                </div>
              )}
            </nav>
          </Scrollable>

          {/* Bottom Section - Fixed */}
          <div className="flex-shrink-0 border-t border-gray-800 p-4 space-y-4">
            {/* Subscribe Button */}
            {!collapsed && (
              <Link
                to="/settings/subscription"
                className="block"
                aria-label="Manage Subscription"
              >
                <div className={`
                  relative overflow-hidden rounded-xl group
                  transition-all duration-300
                  hover:shadow-2xl hover:-translate-y-1
                  ${tenant?.subscription_tier === 'free'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-400'
                    : 'bg-gradient-to-r from-primary-700 to-primary-500'
                  }
                `}>
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-lg animate-pulse" />

                  {/* Content */}
                  <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className={`
                        h-5 w-5 text-white
                        ${tenant?.subscription_tier === 'free' ? 'animate-pulse' : ''}
                      `} />
                      <div>
                        <p className="text-white font-semibold">
                          {tenant?.subscription_tier === 'free' ? 'Subscribe Now' : 'Upgrade Plan'}
                        </p>
                        <p className="text-xs text-white/80">
                          {tenant?.subscription_tier === 'free' ? 'Unlock premium features' : 'Explore more features'}
                        </p>
                      </div>
                    </div>
                    <Sparkles className="h-5 w-5 text-white opacity-75 group-hover:opacity-100" />
                  </div>

                  {/* Animated Border */}
                  {tenant?.subscription_tier === 'free' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-[shimmer_2s_infinite_linear]" />
                  )}
                </div>
              </Link>
            )}

            {/* Settings Button */}
            <Button
              variant="ghost"
              className={`
                w-full ${collapsed ? 'justify-center' : 'justify-start'} text-gray-300 hover:text-white hover:bg-gray-800
                ${location.pathname.startsWith('/settings') ? 'bg-primary text-white' : ''}
              `}
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className={`h-5 w-5 ${collapsed ? '' : 'mr-2'} ${location.pathname.startsWith('/settings') ? 'text-white' : ''}`} />
              {!collapsed && 'Settings'}
              {!collapsed && tenant?.subscription_tier === 'free' && (
                <Badge variant="primary" className="ml-auto">
                  Free
                </Badge>
              )}
            </Button>

          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;