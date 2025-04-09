import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from './ui2/container';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import Footer from './Footer';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top navigation */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 bg-white">
          <Container className="px-8 py-6">
            <Outlet />
          </Container>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;