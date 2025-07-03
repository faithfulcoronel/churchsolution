import React from 'react';
import { Menu, User } from 'lucide-react';
import { Button } from '../ui2/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui2/dropdown-menu';
import { Switch } from '../ui2/switch';
import { useThemeSwitcher } from '@/hooks';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import ChurchBranding from '../ChurchBranding';
import NotificationDropdown from './NotificationDropdown';
import { SidebarTrigger, useSidebar } from '../ui2/sidebar';

function Topbar() {
  const { setOpen: setSidebarOpen, collapsed: sidebarCollapsed } = useSidebar();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { settings, handleThemeToggle } = useThemeSwitcher();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 w-full z-30 flex h-16 shrink-0 items-center justify-end gap-x-4 border-b border-gray-200 bg-primary-gradient dark:bg-gray-800 dark:border-gray-700 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:pr-8 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}
    >
      {/* Sidebar toggle, only on mobile */}
      <SidebarTrigger
        action="open"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </SidebarTrigger>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      {/* Church branding */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center">
          <ChurchBranding />
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme switch */}
          <Switch
            checked={settings.themeMode === 'dark'}
            onCheckedChange={handleThemeToggle}
          />

          {/* Notification dropdown */}
          <NotificationDropdown />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt={user?.email || 'User'} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0]}</p>
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
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Topbar;