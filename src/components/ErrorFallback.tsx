import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui2/button';

interface ErrorFallbackProps {
  onRetry?: () => void;
}

export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We're sorry for the inconvenience. Please try refreshing the page.
        </p>
        <Button onClick={handleRetry}>Refresh Page</Button>
      </div>
    </div>
  );
}
