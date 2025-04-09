import React from 'react';
import { Container } from '../ui2/container';
import ChurchBranding from '../ChurchBranding';
import { Button } from '../ui2/button';
import { Menu as MenuIcon } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
}

function Topbar({ setSidebarOpen }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <Container size="2xl">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" />
          </Button>

          {/* Branding */}
          <div className="flex flex-1 items-center lg:gap-x-6">
            <ChurchBranding />
          </div>

          {/* User menu */}
          <div className="flex items-center gap-x-4">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </Container>
    </header>
  );
}

export default Topbar;