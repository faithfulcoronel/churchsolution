import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useMessageStore } from '../../components/MessageHandler';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui2/card';
import { Input } from '../../components/ui2/input';
import { Button } from '../../components/ui2/button';
import { Separator } from '../../components/ui2/separator';
import { Textarea } from '../../components/ui2/textarea';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type RegistrationData = {
  // User Info
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  
  // Church Info
  churchName: string;
  subdomain: string;
  address: string;
  contactNumber: string;
  churchEmail: string;
  website: string;
};

function Register() {
  const navigate = useNavigate();
  const { addMessage } = useMessageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    churchName: '',
    subdomain: '',
    address: '',
    contactNumber: '',
    churchEmail: '',
    website: '',
  });

  const validateForm = () => {
    // Reset error
    setError(null);

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Name validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    // Church validation
    if (!formData.churchName.trim()) {
      setError('Please enter your church name');
      return false;
    }

    if (!formData.subdomain.trim()) {
      setError('Please enter a subdomain');
      return false;
    }

    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(formData.subdomain)) {
      setError('Subdomain can only contain lowercase letters, numbers, and hyphens');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Please enter your church address');
      return false;
    }

    if (!formData.contactNumber.trim()) {
      setError('Please enter a contact number');
      return false;
    }

    if (!formData.churchEmail.trim()) {
      setError('Please enter a church email');
      return false;
    }

    if (!emailRegex.test(formData.churchEmail)) {
      setError('Please enter a valid church email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create user account');

      // Store registration data and navigate to onboarding
      const registrationData = {
        userId: user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        churchName: formData.churchName,
        subdomain: formData.subdomain,
        address: formData.address,
        contactNumber: formData.contactNumber,
        churchEmail: formData.churchEmail,
        website: formData.website || null,
      };
      
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

      // Navigate to onboarding progress screen
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Register Your Church</h2>
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                sign in to your account
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Admin Account Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Admin Account</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      icon={<User className="h-4 w-4" />}
                    />

                    <Input
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <Input
                    type="email"
                    name="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <Input
                    type="password"
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    icon={<Lock className="h-4 w-4" />}
                    showPasswordToggle
                    helperText="Must be at least 8 characters with uppercase, lowercase, and numbers"
                  />

                  <Input
                    type="password"
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    icon={<Lock className="h-4 w-4" />}
                    showPasswordToggle
                  />
                </div>
              </div>

              <Separator />

              {/* Church Information Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Church Information</h3>
                <div className="space-y-4">
                  <Input
                    name="churchName"
                    label="Church Name"
                    value={formData.churchName}
                    onChange={(e) => setFormData(prev => ({ ...prev, churchName: e.target.value }))}
                    required
                    icon={<Building2 className="h-4 w-4" />}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <Input
                        name="subdomain"
                        label="Subdomain"
                        value={formData.subdomain}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                        }))}
                        required
                        pattern="(?:[a-z0-9]|-)+"
                        icon={<Globe className="h-4 w-4" />}
                        rightElement={
                          <div className="px-3 py-2 bg-muted text-muted-foreground text-sm">
                            .stewardtrack.com
                          </div>
                        }
                        helperText="Only lowercase letters, numbers, and hyphens allowed"
                      />
                    </div>

                    <Input
                      name="website"
                      label="Church Website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      icon={<Globe className="h-4 w-4" />}
                      placeholder="https://example.com"
                    />
                  </div>

                  <Textarea
                    name="address"
                    label="Church Address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    rows={3}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      name="contactNumber"
                      label="Contact Number"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                      required
                      icon={<Phone className="h-4 w-4" />}
                    />

                    <Input
                      type="email"
                      name="churchEmail"
                      label="Church Email"
                      value={formData.churchEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, churchEmail: e.target.value }))}
                      required
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/15 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-destructive">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Register Church'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              By registering, you agree to our{' '}
              <Link to="/settings/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/settings/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Background Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/landing_bg.svg"
          alt="Church interior"
        />
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

export default Register;