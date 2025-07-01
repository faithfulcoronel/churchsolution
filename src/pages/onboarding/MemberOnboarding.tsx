import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui2/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

function MemberOnboarding() {
  const navigate = useNavigate();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setComplete(true);
      sessionStorage.removeItem('memberOnboardingData');
      setTimeout(() => navigate('/login'), 3000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          {complete ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <p className="text-sm text-muted-foreground">
                Registration successful! Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Setting up your account...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MemberOnboarding;
