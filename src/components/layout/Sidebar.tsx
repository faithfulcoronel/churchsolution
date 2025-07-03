import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../stores/authStore';
import { Scrollable } from '../ui2/scrollable';
import { Input } from '../ui2/input';
import { Button } from '../ui2/button';
import { Card } from '../ui2/card';
import { Separator } from '../ui2/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  useSidebar,
} from '../ui2/sidebar';
import {
  Pin,
  PinOff,
  Search,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { navigation as baseNavigation, NavItem } from '../../config/navigation';

function Sidebar() {
  const {
    open: sidebarOpen,
    setOpen: setSidebarOpen,
    collapsed,
    setCollapsed,
    pinned,
    setPinned,
  } = useSidebar();
  const location = useLocation();
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

  // Current auth user
  const { user } = useAuthStore();

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ['current-user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id: user.id,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const fullName = useMemo(() => {
    if (!user) return '';
    const first = (user.user_metadata as any)?.first_name || '';
    const last = (user.user_metadata as any)?.last_name || '';
    const name = `${first} ${last}`.trim();
    return name || user.email || '';
  }, [user]);

  const primaryRole = useMemo(() => {
    return userRoles?.[0]?.role_name || 'User';
  }, [userRoles]);

  const navigation = useMemo(
    () =>
      baseNavigation.filter(
        (item) => !item.permission || hasPermission(item.permission)
      ),
    [hasPermission]
  );

  const itemLevels = useMemo(() => {
    const levels = new Map<string, number>();

    const walk = (items: NavItem[], level = 0) => {
      items.forEach((it) => {
        levels.set(it.name, level);
        if (it.submenu) walk(it.submenu, level + 1);
      });
    };

    walk(navigation);
    return levels;
  }, [navigation]);

  const renderItem = (item: NavItem, level = 0) => {
    const hasChildren = item.submenu && item.submenu.length > 0;
    const padding = collapsed
      ? 'px-3'
      : level === 0
        ? 'px-3'
        : level === 1
          ? 'pl-11 pr-3'
          : level === 2
            ? 'pl-16 pr-3'
            : level === 3
              ? 'pl-20 pr-3'
              : 'pl-24 pr-3';

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
                ? 'bg-primary text-white shadow-md shadow-primary/50'
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
            ? 'bg-primary text-white shadow-md shadow-primary/50'
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
        const level = itemLevels.get(itemName);
        if (level !== undefined) {
          for (const name of Array.from(newOpenSubmenus)) {
            if (itemLevels.get(name) === level) {
              newOpenSubmenus.delete(name);
            }
          }
        }
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
      <SidebarContainer
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-primary-gradient dark:bg-primary-gradient
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-72 ${collapsed ? 'lg:w-20' : 'lg:w-72'}
          flex flex-col transition-all
        `}
      >
        <SidebarHeader className="px-4">
          {/* Logo */}
          <div className="flex-shrink-0 h-16 flex items-center justify-center px-4">
            <img
              src={collapsed ? '/logo_square.svg' : '/logo_long.svg'}
              alt="StewardTrack Logo"
              className={collapsed ? 'h-20' : 'h-12'}
            />
          </div>

          {/* Search Bar and Actions */}
          <div
            className={`${
              collapsed ? 'p-2 justify-center' : 'px-4 py-4'
            } flex items-center space-x-2`}
          >
            {!collapsed && (
              <Input
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="flex-1"
              />
            )}
            <Button
              variant="light"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex h-8 w-8"
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </Button>
            {!collapsed && (
              <Button
                variant="light"
                size="icon"
                onClick={() => setPinned(!pinned)}
                title={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
                className="hidden lg:flex h-8 w-8"
              >
                {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {!collapsed && <Separator className="bg-border" />}
        </SidebarHeader>

        <SidebarContent>
          <Scrollable className={`${collapsed ? 'py-2 px-4' : 'py-4 px-4'}`} shadow={false}>
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
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-4 space-y-4">
          {/* Profile */}
          {!collapsed && (
            <Card size="sm" className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt={fullName} />
                <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{fullName}</span>
                <span className="text-xs text-muted-foreground">{primaryRole}</span>
              </div>
            </Card>
          )}

        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;