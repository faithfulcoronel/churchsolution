import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useMessageStore } from '../../components/MessageHandler';
import { RegistrationProgress } from '../../components/RegistrationProgress';
import { Building2 } from 'lucide-react';

function ChurchOnboarding() {
  const navigate = useNavigate();
  const { addMessage } = useMessageStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const registrationAttempted = useRef(false);

  useEffect(() => {
    // Get registration data from session storage
    const data = sessionStorage.getItem('registrationData');
    if (!data) {
      navigate('/register');
      return;
    }

    const parsedData = JSON.parse(data);
    setRegistrationData(parsedData);

    // Only start registration if not already attempted
    if (!registrationAttempted.current) {
      registrationAttempted.current = true;
      handleRegistration(parsedData);
    }
  }, [navigate]);

  const handleRegistration = async (data: any) => {
    try {
      // Step 1: Creating Church Account
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Setting Up Admin User
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Initializing Database
      setCurrentStep(2);
      
      // Create tenant
      const { error: tenantError } = await supabase.rpc('handle_new_tenant_registration', {
        p_user_id: data.userId,
        p_tenant_name: data.churchName,
        p_tenant_subdomain: data.subdomain,
        p_tenant_address: data.address,
        p_tenant_contact: data.contactNumber,
        p_tenant_email: data.churchEmail,
        p_tenant_website: data.website || null
      });

      if (tenantError) {
        // If tenant creation fails, delete the user
        await supabase.auth.signOut();
        throw tenantError;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Completing Setup
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear registration data
      sessionStorage.removeItem('registrationData');

      // Show success message
      addMessage({
        type: 'success',
        text: 'Church setup completed successfully! Please check your email to verify your account.',
        duration: 5000,
      });

      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error message
      addMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred during setup',
        duration: 5000,
      });

      // Clean up on failure
      try {
        // Sign out to remove auth session
        await supabase.auth.signOut();
        
        // Clear registration data
        sessionStorage.removeItem('registrationData');
        
        // Navigate back to register page
        navigate('/register');
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  };

  if (!registrationData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RegistrationProgress
        isOpen={true}
        currentStep={currentStep}
      />
    </div>
  );
}

export default ChurchOnboarding;