import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import { MessageHandler } from './components/MessageHandler';
import ErrorFallback from './components/ErrorFallback';
import { handleError } from './utils/errorHandler';
import { PathnameProvider } from './providers';
import { usePermissions } from './hooks/usePermissions';
import { useAdminModeStore } from './stores/adminModeStore';
import RequireAuth from './components/RequireAuth';

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
const SuperAdmin = React.lazy(() => import('./pages/super-admin/SuperAdmin'));
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
  const { isSuperAdmin } = usePermissions();
  const { superAdminMode } = useAdminModeStore();

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
        <div className="flex flex-col items-center">
          <img
            src="/landing_logo_with_name.svg"
            className="w-40 dark:hidden"
            alt="Steward Track logo"
          />
          <img
            src="/landing_logo_with_name_dark.svg"
            className="w-40 hidden dark:block"
            alt="Steward Track logo"
          />
          <div className="dot-loader mt-6 flex space-x-2">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <PathnameProvider>
            <React.Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <img
                      src="/landing_logo_with_name.svg"
                      className="w-40 dark:hidden"
                      alt="Steward Track logo"
                    />
                    <img
                      src="/landing_logo_with_name_dark.svg"
                      className="w-40 hidden dark:block"
                      alt="Steward Track logo"
                    />
                    <div className="dot-loader mt-6 flex space-x-2">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
              }
            >
              <MessageHandler />
              <Routes>
                <Route path="/"
                  element={
                  !user ? (
                  <LandingPage />
                      ) : superAdminMode && isSuperAdmin() ? (
                      <Navigate to="/admin-panel/welcome" replace />
                        ) : (
                      <Navigate to="/welcome" replace />
                )}/>
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
              <Route element={<RequireAuth><Layout /></RequireAuth>}>
                  {superAdminMode && isSuperAdmin() ? (
                    <>
                      <Route path="/admin-panel/*" element={<SuperAdmin />} />
                      <Route
                        path="*"
                        element={<Navigate to="/admin-panel/welcome" replace />}
                      />
                    </>
                  ) : (
                    <>
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
                      {isSuperAdmin() && (
                        <Route path="/admin-panel/*" element={<SuperAdmin />} />
                      )}
                      <Route path="/settings/*" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/welcome" replace />} />
                    </>
                  )}
              </Route>
              {!user && <Route path="*" element={<Navigate to="/" replace />} />}
              </Routes>
            </React.Suspense>
          </PathnameProvider>
          </Router>
        </ErrorBoundary>
    );
 }
export default App;
