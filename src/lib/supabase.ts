import { SupabaseClientWrapper } from './SupabaseClientWrapper';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Provide meaningful error messages in development
if (isDevelopment && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(`
    Error: Missing Supabase environment variables

    Please make sure you have the following environment variables set in your .env file:
    VITE_SUPABASE_URL=your-project-url
    VITE_SUPABASE_ANON_KEY=your-anon-key

    You can get these values from your Supabase project settings.
    If you haven't set up Supabase yet, please click the "Connect to Supabase" button.
  `);
}

// Instantiate custom wrapper
export const supabaseWrapper = new SupabaseClientWrapper(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export const supabase = supabaseWrapper.supabase;

// Add a type guard for checking Supabase connection
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Add a connection check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('members').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};