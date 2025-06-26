import { type NotifyErrorOptions } from '../hooks/useNotifications';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ErrorLogService } from '../services/ErrorLogService';

// Error types
type ErrorType = 'auth' | 'database' | 'network' | 'validation' | 'unknown';

// Error messages for users
const USER_FRIENDLY_MESSAGES: Record<ErrorType, string> = {
  auth: 'There was a problem with your account access. Please try signing in again.',
  database: 'Unable to process your request. Please try again later.',
  network: 'Network connection issue. Please check your internet connection.',
  validation: 'Please check your input and try again.',
  unknown: 'An unexpected error occurred. Please try again later.',
};

// Function to determine error type
function getErrorType(error: any): ErrorType {
  if (error.code?.startsWith('PGRST') || error.code?.match(/^[0-9]{5}$/)) {
    return 'database';
  }

  if (error.name === 'AuthError' || error.message?.toLowerCase().includes('auth')) {
    return 'auth';
  }

  if (error instanceof TypeError || error.name === 'NetworkError' || !navigator.onLine) {
    return 'network';
  }

  if (error.name === 'ValidationError' || error.message?.toLowerCase().includes('validation')) {
    return 'validation';
  }

  return 'unknown';
}

// Function to get user-friendly message
function getUserFriendlyMessage(error: any): string {
  const errorType = getErrorType(error);
  return USER_FRIENDLY_MESSAGES[errorType];
}

// Function to log error details
function logError(error: any, context?: Record<string, any>) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    type: getErrorType(error),
    message: error.message,
    stack: error.stack,
    context,
    code: error.code,
    details: error.details,
    hint: error.hint,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error Details:', errorDetails);
  }

  const service = container.get<ErrorLogService>(TYPES.ErrorLogService);
  service.logError(errorDetails.message, errorDetails.stack, errorDetails);
}

// Main error handler function - now returns error info instead of showing notification
export function handleError(error: any, context?: Record<string, any>) {
  // Log the error
  logError(error, context);

  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(error);

  // Return the error details for handling by the component
  return {
    type: getErrorType(error),
    message: userMessage,
    originalError: error,
    context
  };
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Hook for try/catch blocks
export function useTryCatch(notifyError: (error: Error, options?: NotifyErrorOptions) => void) {
  return async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error) {
      const errorInfo = handleError(error, context);
      notifyError(new Error(errorInfo.message), {
        originalError: errorInfo.originalError,
        ...errorInfo.context
      });
      return undefined;
    }
  };
}