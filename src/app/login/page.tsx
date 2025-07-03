"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm from '@/components/auth/auth-form';
import { Car, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      // Supabase is not configured, so we can't check for an active session.
      // The auth form will be disabled automatically.
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-8">
            <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                <BarChart3 className="w-8 h-8" />
            </div>
          <h1 className="text-3xl font-bold text-foreground">
            InsurDash 洞察
          </h1>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
