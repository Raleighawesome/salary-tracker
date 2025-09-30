import { createClient } from '@supabase/supabase-js';

const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

// Simple cookie-based storage to persist Supabase sessions across browser restarts
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') {
      return null;
    }
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') {
      return;
    }
    // Store cookie for one year
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') {
      return;
    }
    document.cookie = `${key}=; path=/; max-age=0;`;
  }
};

const fallbackQueryBuilder = {
  select: () => fallbackQueryBuilder,
  eq: () => fallbackQueryBuilder,
  maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }),
  insert: async () => ({ error: new Error('Supabase not configured') }),
  update: async () => ({ error: new Error('Supabase not configured') }),
  upsert: async () => ({ error: new Error('Supabase not configured') }),
  delete: async () => ({ error: new Error('Supabase not configured') })
};

const fallbackClient = {
  from() {
    return fallbackQueryBuilder;
  },
  auth: {
    async getSession() {
      return { data: { session: null }, error: new Error('Supabase not configured') };
    },
    async signInWithPassword() {
      return { data: { session: null }, error: new Error('Supabase not configured') };
    },
    async signOut() {
      return { error: new Error('Supabase not configured') };
    },
    onAuthStateChange() {
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // no-op
            }
          }
        },
        error: new Error('Supabase not configured')
      };
    }
  }
} as unknown as ReturnType<typeof createClient>;

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return fallbackClient;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: cookieStorage as never,
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return supabaseInstance;
}
