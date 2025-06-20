import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Footer from './Footer';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Check if current page is settings
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top navigation */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className={`flex-1 ${isSettingsPage ? '' : 'bg-white dark:bg-gray-900'}`}>
          {isSettingsPage ? (
            <Outlet />
          ) : (
            <div className="px-8 py-6">
              <Outlet />
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;