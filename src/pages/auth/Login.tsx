import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LogIn, Loader2, AlertCircle, Mail, Lock, Building2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Container } from '../../components/ui/Container';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setResetSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Container>
          <Card className="max-w-md w-full mx-auto">
            <div className="text-center">
              <div className="flex justify-center">
                <Building2 className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {resetMode ? 'Reset your password' : 'Sign in to your account'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {resetMode ? (
                  'Enter your email to receive reset instructions'
                ) : (
                  <>
                    Or{' '}
                    <Link
                      to="/register"
                      className="font-medium text-primary-600 hover:text-primary-500"
                    >
                      register your church
                    </Link>
                  </>
                )}
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {resetSuccess && (
              <div className="mt-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <Mail className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Check your email for password reset instructions
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={resetMode ? handleResetPassword : handleLogin}>
              <div className="space-y-4">
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />

                {!resetMode && (
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(!resetMode);
                      setError(null);
                      setResetSuccess(false);
                    }}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    {resetMode ? 'Back to sign in' : 'Forgot your password?'}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                icon={resetMode ? <Mail /> : <LogIn />}
                className="w-full"
              >
                {resetMode ? 'Send Reset Instructions' : 'Sign in'}
              </Button>
            </form>
          </Card>
        </Container>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
          alt="Church interior"
        />
        <div className="absolute inset-0 bg-primary-900 bg-opacity-50 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Steward Track</h1>
            <p className="text-xl">
              Streamline your church administration with our comprehensive management solution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;