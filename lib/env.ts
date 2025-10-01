// Environment variable configuration with fallbacks
// These values are loaded on the client-side, so they must be prefixed with NEXT_PUBLIC_

// Supabase configuration - required for authentication and data storage
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Export env object for easier consumption
export const env = {
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
};
