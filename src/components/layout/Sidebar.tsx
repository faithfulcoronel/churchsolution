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
  Search,
  ChevronDown
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

  const initials = useMemo(() => {
    if (!user) return '';
    const first = (user.user_metadata as any)?.first_name || '';
    const last = (user.user_metadata as any)?.last_name || '';
    const init = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase().trim();
    return init || user.email?.charAt(0).toUpperCase() || '';
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

  const menuItemCount = useMemo(() => {
    let count = 0;
    const walk = (items: NavItem[]) => {
      items.forEach((it) => {
        count += 1;
        if (it.submenu) walk(it.submenu);
      });
    };
    walk(navigation);
    return count;
  }, [navigation]);


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

  const showSearch = menuItemCount > 20;

  React.useEffect(() => {
    if (!showSearch && searchTerm) {
      setSearchTerm('');
    }
  }, [showSearch, searchTerm]);

  const renderItem = (item: NavItem, level = 0) => {
    const hasChildren = item.submenu && item.submenu.length > 0;
    const padding = collapsed
      ? 'px-4'
      : level === 0
        ? 'px-4'
        : level === 1
          ? 'pl-11 pr-4'
          : level === 2
            ? 'pl-16 pr-4'
            : level === 3
              ? 'pl-20 pr-4'
              : 'pl-24 pr-4';

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleSubmenu(item.name)}
            title={collapsed ? item.name : undefined}
            className={`
              w-full group flex items-center justify-between rounded-full ${padding} py-2.5 text-sm font-medium
              transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 focus:outline outline-green-400 ${collapsed ? 'justify-center' : ''}
              ${isNavItemActive(item)
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-sm'
                : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                ? 'bg-primary/20 text-white'
                : 'text-white/80 hover:bg-gradient-to-r hover:from-green-400/20 hover:to-green-500/20 hover:text-white hover:font-semibold dark:hover:bg-green-900 dark:hover:shadow-inner'}
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ease-in-out ${isNavItemActive(item) ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
              />
              {!collapsed && <span>{item.name}</span>}
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
          group flex items-center gap-3 rounded-full ${padding} py-2.5 text-sm font-medium
          transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 focus:outline outline-green-400 ${collapsed ? 'justify-center' : ''}
          ${isNavItemActive(item)
            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-sm'
            : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ? 'bg-primary/20 text-white'
            : 'text-white/80 hover:bg-gradient-to-r hover:from-green-400/20 hover:to-green-500/20 hover:text-white hover:font-semibold dark:hover:bg-green-900 dark:hover:shadow-inner'}
        `}
      >
        <item.icon
          className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ease-in-out ${isNavItemActive(item) ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
        />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  // Recursively filter navigation items based on search term and group by section
  const filteredNavigation = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    const filterItems = (items: NavItem[]): NavItem[] =>
      items
        .map((item) => {
          const matches =
            !searchTerm || item.name.toLowerCase().includes(searchLower);
          const children = item.submenu ? filterItems(item.submenu) : undefined;

          if (matches || (children && children.length > 0)) {
            return { ...item, submenu: children };
          }
          return matches ? { ...item, submenu: children } : null;
        })
        .filter((item): item is NavItem => item !== null);

    const items = filterItems(navigation);
    const groups = new Map<string, NavItem[]>();
    items.forEach((it) => {
      const section = it.section || 'Other';
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section)!.push(it);
    });
    return Array.from(groups.entries());
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

      filteredNavigation.forEach(([, items]) => collect(items));
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
          <div
            className={`flex-shrink-0 h-16 flex items-center justify-center px-4 ${collapsed ? '' : 'pt-3'}`}
          >
            <img
              src={collapsed ? '/logo_square.svg' : '/logo_long.svg'}
              alt="StewardTrack Logo"
              className={collapsed ? 'h-8' : 'h-10'}
            />
          </div>

          {/* Search Bar and Actions */}
          <div
            className={`${
              collapsed ? 'p-2 justify-center' : 'px-4 py-4'
            } flex items-center space-x-2`}
          >
            {!collapsed && showSearch && (
              <Input
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="flex-1"
              />
            )}
          </div>

          {!collapsed && <Separator className="bg-border" />}
        </SidebarHeader>

        <SidebarContent>
          <Scrollable className={`${collapsed ? 'py-2 px-4' : 'py-4 px-4'}`} shadow={false}>
            <nav className="space-y-1">
              {filteredNavigation.map(([section, items], idx) => (
                <React.Fragment key={section}>
                  {!collapsed && (
                    <div className={`${idx === 0 ? '' : 'mt-4'} uppercase text-xs text-white/60`}>{section}</div>
                  )}
                  <div className="space-y-1 mt-1">
                    {items.map((item) => renderItem(item))}
                  </div>
                  {idx < filteredNavigation.length - 1 && (
                    <div className="mt-4 border-t border-white/20" />
                  )}
                </React.Fragment>
              ))}

              {/* No results message */}
              {filteredNavigation.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No menu items found</div>
              )}
            </nav>
          </Scrollable>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-4 space-y-4">
          {/* Profile */}
          {!collapsed && (
            <Card
              size="sm"
              className="flex items-center space-x-3 rounded-xl p-4 bg-gradient-to-br from-emerald-500/70 to-teal-500/70 hover:brightness-105 transition"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-sm text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{fullName}</span>
                <span className="text-xs text-white/80">{primaryRole}</span>
              </div>
            </Card>
          )}

        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}

export default Sidebar;
