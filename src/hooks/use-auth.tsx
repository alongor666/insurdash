
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
  isSupabaseConfigured: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    // If supabase is not configured, stop loading and do nothing.
    if (!supabase) {
        setLoading(false);
        return;
    }

    // onAuthStateChange fires on load and on auth events.
    // This is the single source of truth for the user's auth state.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return; // Wait until the initial auth check is complete

    // If not logged in and not already on the login page, redirect there.
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
    
    // If logged in and on the login page, redirect to the dashboard.
    if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  const value = {
    user,
    login: (email: string, pass: string) => {
        if (!supabase) throw new Error("Supabase not configured");
        return supabase.auth.signInWithPassword({ email, password: pass });
    },
    logout: async () => {
        if (!supabase) throw new Error("Supabase not configured");
        // The listener will handle user state change and redirect.
        await supabase.auth.signOut();
    },
    loading,
    isSupabaseConfigured
  };

  // While the initial auth check is running, show a global loader.
  // This prevents content flicker.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
