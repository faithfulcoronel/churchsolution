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
  Home,
  Users,
  DollarSign,
  Settings as SettingsIcon,
  Crown,
  Building2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  Heart,
  BarChart3,
  FileText,
  CreditCard,
  History,
  Shield,
  Menu,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Get current tenant
  const { data: tenant } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  const navigation = [
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
        }
      ]
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
        }
      ]
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
      ]
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
      ]
    },
  ];

  // Filter navigation items based on search term
  const filteredNavigation = useMemo(() => {
    if (!searchTerm) return navigation;

    const searchLower = searchTerm.toLowerCase();
    
    return navigation.filter(item => {
      // Check if main item matches
      const mainItemMatches = item.name.toLowerCase().includes(searchLower);
      
      // Check if any submenu items match
      const submenuMatches = item.submenu?.some(
        subitem => subitem.name.toLowerCase().includes(searchLower)
      );

      // Show item if either main item or any submenu items match
      return mainItemMatches || submenuMatches;
    }).map(item => {
      // If item has submenu, filter submenu items too
      if (item.submenu) {
        return {
          ...item,
          submenu: item.submenu.filter(
            subitem => subitem.name.toLowerCase().includes(searchLower) || item.name.toLowerCase().includes(searchLower)
          )
        };
      }
      return item;
    });
  }, [navigation, searchTerm]);

  // Handle submenu toggle
  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenus(prev => {
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
  React.useEffect(() => {
    if (searchTerm) {
      // Open all submenus that have matching items
      const matchingSubmenus = filteredNavigation
        .filter(item => item.submenu?.length > 0)
        .map(item => item.name);
      
      setOpenSubmenus(new Set(matchingSubmenus));
    }
  }, [searchTerm, filteredNavigation]);

  // Check if a submenu is open
  const isSubmenuOpen = (itemName: string) => {
    return openSubmenus.has(itemName);
  };

  // Auto-expand submenu based on current path
  React.useEffect(() => {
    const currentPath = location.pathname;
    
    navigation.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(subitem => 
          currentPath.startsWith(subitem.href)
        );
        
        if (hasActiveChild) {
          setOpenSubmenus(prev => {
            const newOpenSubmenus = new Set(prev);
            newOpenSubmenus.add(item.name);
            return newOpenSubmenus;
          });
        }
      }
    });
  }, [location.pathname]);

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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full px-2">
          {/* Logo */}
          <div className="flex-shrink-0 h-16 flex items-center justify-center px-4">
            <div className="flex items-center space-x-2">
              <img src="/logo_long.svg" alt="StewardTrack Logo with name"/>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-2 py-4">
            <Input
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus:border-primary focus:ring-primary"
            />
          </div>

          <Separator className="bg-gray-800" />

          {/* Navigation - Scrollable Area */}
          <Scrollable className="flex-1 py-4" shadow={false}>
            <nav className="space-y-1">
              {filteredNavigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`
                          w-full group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium
                          transition-colors duration-200
                          ${location.pathname.startsWith(item.href || '')
                            ? 'bg-primary text-white'
                            : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                            ? 'bg-primary/20 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <item.icon className={`
                            h-5 w-5 flex-shrink-0 transition-colors
                            ${location.pathname.startsWith(item.href || '')
                              ? 'text-white'
                              : 'text-gray-400 group-hover:text-white'
                            }
                          `} />
                          <span className="ml-3">{item.name}</span>
                        </div>
                        <ChevronDown className={`
                          h-4 w-4 transition-transform duration-200
                          ${isSubmenuOpen(item.name) ? 'rotate-180' : ''}
                        `} />
                      </button>
                      
                      <div className={`
                        mt-1 space-y-1 transition-all duration-200
                        ${isSubmenuOpen(item.name) ? 'max-h-96' : 'max-h-0 overflow-hidden'}
                      `}>
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            className={`
                              group flex items-center rounded-lg pl-11 pr-3 py-2 text-sm font-medium
                              transition-colors duration-200
                              ${location.pathname.startsWith(subitem.href)
                                ? 'bg-primary text-white'
                                : searchTerm && subitem.name.toLowerCase().includes(searchTerm.toLowerCase())
                                ? 'bg-primary/20 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              }
                            `}
                          >
                            <subitem.icon className={`
                              mr-3 h-4 w-4 flex-shrink-0 transition-colors
                              ${location.pathname.startsWith(subitem.href)
                                ? 'text-white'
                                : 'text-gray-400 group-hover:text-white'
                              }
                            `} />
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href || ''}
                      className={`
                        group flex items-center rounded-lg px-3 py-2 text-sm font-medium
                        transition-colors duration-200
                        ${location.pathname.startsWith(item.href || '')
                          ? 'bg-primary text-white'
                          : searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())
                          ? 'bg-primary/20 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className={`
                        mr-3 h-5 w-5 flex-shrink-0 transition-colors
                        ${location.pathname.startsWith(item.href || '')
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                        }
                      `} />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

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

            {/* Settings Button */}
            <Button
              variant="ghost"
              className={`
                w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800
                ${location.pathname.startsWith('/settings') ? 'bg-primary text-white' : ''}
              `}
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon className={`h-5 w-5 mr-2 ${location.pathname.startsWith('/settings') ? 'text-white' : ''}`} />
              Settings
              {tenant?.subscription_tier === 'free' && (
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