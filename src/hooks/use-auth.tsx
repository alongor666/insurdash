
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
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
  // Memoize the client to prevent re-creating it on every render.
  const supabase = useMemo(createClient, []);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If supabase is not configured, stop loading and do nothing.
    if (!isSupabaseConfigured) {
        setLoading(false);
        return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial check for the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname === '/login';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    }
    
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  const value = {
    user,
    login: (email: string, pass: string) => {
        if (!isSupabaseConfigured) throw new Error("Supabase not configured");
        return supabase.auth.signInWithPassword({ email, password: pass });
    },
    logout: async () => {
        if (!isSupabaseConfigured) throw new Error("Supabase not configured");
        await supabase.auth.signOut();
        router.push('/login'); // Force redirect after logout
    },
    loading,
    isSupabaseConfigured
  };

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
