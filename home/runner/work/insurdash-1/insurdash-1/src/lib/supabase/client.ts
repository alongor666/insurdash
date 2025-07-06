import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js';

// Define a function to create a Supabase client for client-side operations
export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // This will be caught by the useAuth hook and displayed to the user.
    // We create a "dummy" client here to satisfy type requirements,
    // which will throw an error if any of its methods are called.
    return new Proxy({}, {
        get(target, prop) {
            if (prop === 'auth') return target; // Allow auth property access
            throw new Error("Supabase is not configured. Please check your environment variables.");
        }
    }) as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

// A global flag to check if the keys are provided, used for UI feedback.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
