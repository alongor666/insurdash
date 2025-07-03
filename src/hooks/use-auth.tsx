
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  isSupabaseConfigured: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setLoading(false);
        return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if(event === 'SIGNED_OUT') {
            router.push('/login');
        }
      }
    );

    // Check initial session
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
    }
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isSupabaseConfigured, router]);

  const value = {
    user,
    login: (email: string, pass: string) => {
        if (!supabase) throw new Error("Supabase not configured");
        return supabase.auth.signInWithPassword({ email, password: pass });
    },
    logout: async () => {
        if (!supabase) throw new Error("Supabase not configured");
        await supabase.auth.signOut();
        setUser(null);
    },
    loading,
    isSupabaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
