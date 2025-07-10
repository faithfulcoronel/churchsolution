import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Footer from './Footer';
import { SidebarProvider, useSidebar } from './ui2/sidebar';
import { cn } from '@/lib/utils';
import { useAdminModeStore } from '../stores/adminModeStore';
import { usePermissions } from '../hooks/usePermissions';

function LayoutContent() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const { setSuperAdminMode } = useAdminModeStore();
  const { hasRole } = usePermissions();

  useEffect(() => {
    if (hasRole('super_admin')) {
      setSuperAdminMode(true);
    } else {
      setSuperAdminMode(location.pathname.startsWith('/admin-panel'));
    }
  }, [location.pathname, hasRole, setSuperAdminMode]);

  // Check if current page is settings
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <div className="min-h-screen w-screen flex bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content wrapper */}
      <div
        className={`flex-1 w-screen overflow-x-hidden flex flex-col min-h-screen pb-24 pt-16 transition-all duration-300 ${collapsed ? 'lg:pl-16' : 'lg:pl-72'}`}
      >
        {/* Top navigation */}
        <Topbar />

        {/* Main content */}
        <main
          className={cn('flex-1 w-full','bg-gray-50 dark:bg-gray-800')}
        >
          {isSettingsPage ? (
            <Outlet />
          ) : (
            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <Outlet />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer sidebarCollapsed={collapsed} />
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
