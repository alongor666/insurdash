
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

const Ctx = createContext<{ user: User | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, ses) =>
      setUser(ses?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
