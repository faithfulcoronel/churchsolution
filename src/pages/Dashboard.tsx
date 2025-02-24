import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useWelcomeStore } from '../stores/welcomeStore';
import { WelcomeModal } from '../components/WelcomeModal';
import ChurchDashboard from './dashboard/ChurchDashboard';
import PersonalDashboard from './dashboard/PersonalDashboard';
import DashboardLayout from './dashboard/DashboardLayout';

function Dashboard() {
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const { hasSeenWelcome, setHasSeenWelcome } = useWelcomeStore();

  // Get current tenant
  const { data: currentTenant } = useQuery({
    queryKey: ['current-tenant'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_tenant');
      if (error) throw error;
      return data?.[0];
    },
  });

  useEffect(() => {
    if (currentTenant && !hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [currentTenant, hasSeenWelcome]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  // Only redirect if we're at exactly /dashboard
  if (location.pathname === '/dashboard') {
    return <Navigate to="/dashboard/church" replace />;
  }

  return (
    <>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="church" element={<ChurchDashboard />} />
          <Route path="personal" element={<PersonalDashboard />} />
        </Route>
      </Routes>

      {/* Welcome Modal */}
      {currentTenant && (
        <WelcomeModal
          isOpen={showWelcome}
          onClose={handleCloseWelcome}
          churchName={currentTenant.name}
        />
      )}
    </>
  );
}

export default Dashboard;