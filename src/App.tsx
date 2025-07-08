import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { MessageHandler } from './components/MessageHandler';
import { handleError } from './utils/errorHandler';
import { Card, CardContent } from './components/ui2/card';
import { Button } from './components/ui2/button';
import { AlertTriangle } from 'lucide-react';

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
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { message } = handleError(error, { errorInfo });
    this.setState({ message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="space-y-6 py-8">
              <img src="/logo_square.svg" alt="StewardTrack logo" className="h-12 mx-auto" />
              <AlertTriangle className="h-10 w-10 text-warning mx-auto" />
              <h2 className="text-2xl font-semibold">Oops! Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                {this.state.message || 'An unexpected error occurred. Please try refreshing the page.'}
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                <Button variant="outline" asChild>
                  <Link to="/support/add">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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