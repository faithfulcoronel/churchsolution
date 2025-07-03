import React, { useMemo } from 'react';
import { Menu, User, Search, Sun, Moon, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui2/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui2/dropdown-menu';
import { Input } from '../ui2/input';
import { useThemeSwitcher } from '@/hooks';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import ChurchBranding from '../ChurchBranding';
import { SidebarTrigger, useSidebar } from '../ui2/sidebar';
import NotificationDropdown from './NotificationDropdown';
import { cn } from '@/lib/utils';

function Topbar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { settings, handleThemeToggle } = useThemeSwitcher();
  // No direct notification listener here. The dropdown handles fetching
  // and listening for notification events.

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
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-50 dark:bg-gray-800 py-2 px-6 shadow-sm transition-all',
        collapsed ? 'lg:left-20' : 'lg:left-72'
      )}
    >
      <div className="flex items-center space-x-3">
        <SidebarTrigger
          action="open"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </SidebarTrigger>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:inline-flex"
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:block">
          <Input
            placeholder="Search StewardTrack..."
            icon={<Search className="h-4 w-4 text-gray-500" />}
            className="w-72 md:w-96 rounded-full"
            aria-label="Search"
          />
        </div>

        <NotificationDropdown />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleThemeToggle(settings.themeMode !== 'dark')}
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
              className="flex items-center bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
              aria-label="Open user menu"
            >
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                {initials}
              </div>
              <div className="ml-2 text-sm leading-tight">
                <p className="font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
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