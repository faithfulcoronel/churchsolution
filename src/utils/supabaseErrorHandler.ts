import { PostgrestError } from '@supabase/supabase-js';
import { useNotifications } from '../hooks/useNotifications';

// Map of database error codes to user-friendly messages
const DB_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'This operation cannot be completed because the record is being used elsewhere.',
  '23502': 'Required information is missing.',
  '42P01': 'System configuration error.',
  '42501': 'You don\'t have permission to perform this action.',
  '42703': 'Database schema error. Please contact support.',
  'PGRST116': 'Multiple records found where only one was expected.',
  'PGRST301': 'Your session has expired. Please sign in again.',
  'PGRST302': 'You don\'t have permission to perform this action.',
};

export function handleSupabaseError(
  error: PostgrestError,
  context?: Record<string, any>
) {
  // Get user-friendly message based on error code
  const userMessage = DB_ERROR_MESSAGES[error.code] || 'An unexpected database error occurred.';

  // Log the detailed error
  const errorDetails = {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    context,
  };

  console.error('Database Error:', errorDetails);

  // Show notification
  const { notifyError } = useNotifications();
  notifyError(new Error(userMessage), errorDetails);
}