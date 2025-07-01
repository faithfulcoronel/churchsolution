import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { MessageHandler } from './components/MessageHandler';
import { handleError } from './utils/errorHandler';

// Lazy load components
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const MemberRegister = React.lazy(() => import('./pages/auth/MemberRegister'));
const ChurchOnboarding = React.lazy(() => import('./pages/onboarding/ChurchOnboarding'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Members = React.lazy(() => import('./pages/members/Members'));
const Finances = React.lazy(() => import('./pages/finances/Finances'));
const Accounts = React.lazy(() => import('./pages/accounts/Accounts'));
const Administration = React.lazy(() => import('./pages/admin/Administration'));
const AnnouncementList = React.lazy(() => import('./pages/announcements/AnnouncementList'));
const Layout = React.lazy(() => import('./components/Layout'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Welcome = React.lazy(() => import('./pages/Welcome'));
const ActivityList = React.lazy(() => import('./pages/activity/ActivityList'));


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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
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
                  <Route path="/accounts/*" element={<Accounts />} />
                  <Route path="/announcements" element={<AnnouncementList />} />
                  <Route path="/administration/*" element={<Administration />} />
                  <Route path="/settings/*" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Route>
              ) : (
                <Route path="*" element={<Navigate to="/" replace />} />
              )}
            </Routes>
            </React.Suspense>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;