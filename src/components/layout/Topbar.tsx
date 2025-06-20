import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  User
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { Button } from '../ui2/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui2/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui2/dropdown-menu';

import { useSettings } from '@/providers/SettingsProvider';
import { useAuthStore } from '../../stores/authStore';

import ChurchBranding from '../ChurchBranding';
import { NotificationDropdown } from './NotificationDropdown';

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
}

function Topbar({ setSidebarOpen }: TopbarProps) {
  const { settings, storeSettings } = useSettings();
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const toggleTheme = () => {
    storeSettings({
      themeMode: settings.themeMode === 'dark' ? 'light' : 'dark'
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>

          {/* Branding */}
          <div className="flex flex-1 items-center lg:gap-x-6">
            <ChurchBranding />
          </div>

          {/* User menu */}
          <div className="flex items-center gap-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {settings.themeMode === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
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
      </div>
    </header>
  );
}

export default Topbar;