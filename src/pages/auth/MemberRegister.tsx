import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useMessageStore } from '../../components/MessageHandler';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { AlertCircle, Loader2, Mail, Lock, User } from 'lucide-react';
import { Combobox, ComboboxOption } from '../../components/ui2/combobox';

function MemberRegister() {
  const navigate = useNavigate();
  const { addMessage } = useMessageStore();
  const [tenants, setTenants] = useState<ComboboxOption[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantSearch, setTenantSearch] = useState('');
  const [form, setForm] = useState({
    tenantId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantSearch) {
      setTenants([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoadingTenants(true);
      const { data, error } = await supabase
        .from('public_tenants')
        .select('id, name')
        .ilike('name', `%${tenantSearch}%`)
        .order('name')
        .limit(10);
      if (!controller.signal.aborted) {
        if (error) {
          console.error('Error fetching tenants', error);
        } else {
          setTenants((data || []).map(t => ({ value: t.id, label: t.name })));
        }
        setLoadingTenants(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [tenantSearch]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return false;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!form.tenantId) {
      setError('Please select your church');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    try {
      setSubmitting(true);
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
          },
        },
      });
      if (signUpError || !user) throw signUpError || new Error('Unable to register');

      const { error: linkError } = await supabase.from('tenant_users').insert({
        tenant_id: form.tenantId,
        user_id: user.id,
        admin_role: 'member',
        created_by: user.id,
      });
      if (linkError) throw linkError;

      addMessage({ type: 'success', text: 'Registration successful! Please check your email to verify your account.', duration: 5000 });
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Join Your Church</h2>
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/90">
                sign in to your account
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <Combobox
                  options={tenants}
                  value={form.tenantId}
                  onChange={v => handleChange('tenantId', v)}
                  placeholder="Search your church"
                  onSearchChange={setTenantSearch}
                  disabled={loadingTenants}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    name="firstName"
                    label="First Name"
                    value={form.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    required
                    icon={<User className="h-4 w-4" />}
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    value={form.lastName}
                    onChange={e => handleChange('lastName', e.target.value)}
                    required
                    icon={<User className="h-4 w-4" />}
                  />
                </div>
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                  icon={<Mail className="h-4 w-4" />}
                />
                <Input
                  type="password"
                  name="password"
                  label="Password"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={form.confirm}
                  onChange={e => handleChange('confirm', e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                />
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/15 p-4 flex">
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              By registering, you agree to our{' '}
              <Link to="/settings/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}and{' '}
              <Link to="/settings/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img className="absolute inset-0 h-full w-full object-cover" src="/landing_bg.svg" alt="Church interior" />
        <div className="absolute inset-0 bg-primary-900 bg-opacity-50 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-left text-white">
            <img className="h-12" src="/logo_long.svg" alt="Logo" />
            <br />
            <h1 className="text-7xl font-bold mb-4">Making church</h1>
            <h1 className="text-7xl font-bold mb-4">management</h1>
            <h1 className="text-7xl font-bold mb-4">much easier.</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberRegister;
