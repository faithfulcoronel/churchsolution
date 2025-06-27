import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Footer from './Footer';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const location = useLocation();
  
  // Check if current page is settings
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <div className="min-h-screen w-screen flex bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pinned={sidebarPinned}
        setPinned={setSidebarPinned}
      />

      {/* Main content wrapper */}
      <div
        className={`flex-1 w-screen overflow-x-hidden flex flex-col min-h-screen pb-24 pt-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}
      >
        {/* Top navigation */}
        <Topbar
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main content */}
        <main className={`flex-1 w-full ${isSettingsPage ? '' : 'bg-white dark:bg-gray-800'}`}>
          {isSettingsPage ? (
            <Outlet />
          ) : (
            <div className="px-8 py-6">
              <Outlet />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer sidebarCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}

export default Layout;