import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { MessageHandler } from './components/MessageHandler';
import ErrorFallback from './components/ErrorFallback';
import { handleError } from './utils/errorHandler';
import { PathnameProvider } from './providers';

// Lazy load components
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const MemberRegister = React.lazy(() => import('./pages/auth/MemberRegister'));
const MemberOnboarding = React.lazy(() => import('./pages/onboarding/MemberOnboarding'));
const ChurchOnboarding = React.lazy(() => import('./pages/onboarding/ChurchOnboarding'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Members = React.lazy(() => import('./pages/members/Members'));
const Finances = React.lazy(() => import('./pages/finances/Finances'));
const Offerings = React.lazy(() => import('./pages/offerings/Offerings'));
const Expenses = React.lazy(() => import('./pages/expenses/Expenses'));
const Accounts = React.lazy(() => import('./pages/accounts/Accounts'));
const Administration = React.lazy(() => import('./pages/admin/Administration'));
const AnnouncementList = React.lazy(() => import('./pages/announcements/AnnouncementList'));
const Layout = React.lazy(() => import('./components/Layout'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Welcome = React.lazy(() => import('./pages/Welcome'));
const ActivityList = React.lazy(() => import('./pages/activity/ActivityList'));
const Support = React.lazy(() => import('./pages/support/Support'));


// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleError(error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

function App() {
  const { setUser, user, loading } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <PathnameProvider>
            <React.Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              }
            >
              <MessageHandler />
              <Routes>
              {/* Public routes */}
                <Route
                  path="/"
                  element={!user ? <LandingPage /> : <Navigate to="/welcome" replace />}
                />
                <Route
                  path="/login"
                  element={!user ? <Login /> : <Navigate to="/welcome" replace />}
                />
                <Route
                  path="/register"
                  element={!user ? <Register /> : <Navigate to="/welcome" replace />}
                />
                <Route
                  path="/register-member"
                  element={!user ? <MemberRegister /> : <Navigate to="/welcome" replace />}
                />
                <Route
                  path="/member-onboarding"
                  element={<MemberOnboarding />}
                />
              <Route
                path="/onboarding"
                element={user ? <ChurchOnboarding /> : <Navigate to="/register" replace />}
              />

              {/* Protected routes */}
              {user ? (
                <Route element={<Layout />}>
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/activity" element={<ActivityList />} />
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/members/*" element={<Members />} />
                  <Route path="/finances/*" element={<Finances />} />
                  <Route path="/expenses/*" element={<Expenses />} />
                  <Route path="/offerings/*" element={<Offerings />} />
                  <Route path="/accounts/*" element={<Accounts />} />
                  <Route path="/announcements" element={<AnnouncementList />} />
                  <Route path="/support/*" element={<Support />} />
                  <Route path="/admin/*" element={<Administration />} />
                  <Route path="/administration/*" element={<Administration />} />
                  <Route path="/settings/*" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/" replace />} />
              )}
              </Routes>
            </React.Suspense>
          </PathnameProvider>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}export default App;