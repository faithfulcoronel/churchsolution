import React, { useMemo } from 'react';
import { Menu, User, Search, Sun, Moon, Bell } from 'lucide-react';
import { Button } from '../ui2/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui2/dropdown-menu';
import { Input } from '../ui2/input';
import { useThemeSwitcher } from '@/hooks';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import ChurchBranding from '../ChurchBranding';
import { SidebarTrigger, useSidebar } from '../ui2/sidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useNotificationListener } from '../../hooks/useNotificationListener';

function Topbar() {
  const { setOpen: setSidebarOpen } = useSidebar();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { settings, handleThemeToggle } = useThemeSwitcher();
  useNotificationListener();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('is_read')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as { is_read: boolean }[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const userName = useMemo(() => {
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 inset-x-0 flex items-center justify-between bg-gray-50 dark:bg-gray-800 py-2 px-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <SidebarTrigger
          action="open"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </SidebarTrigger>
        <ChurchBranding />
      </div>

      <div className="flex-1 px-4 hidden sm:block">
        <Input
          placeholder="Search StewardTrack..."
          icon={<Search className="h-4 w-4 text-gray-500" />}
          className="w-64 md:w-80 rounded-full"
          aria-label="Search"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-green-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          aria-label="Toggle dark mode"
        >
          {settings.themeMode === 'dark' ? (
            <Sun className="h-5 w-5 text-gray-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-500" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
              aria-label="Open user menu"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                {initials}
              </div>
              <div className="ml-2 text-sm leading-tight">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Topbar;