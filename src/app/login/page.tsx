"use client";

import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/auth-form';
import { Eye } from 'lucide-react';

export default function LoginPage() {
  const { isSupabaseConfigured } = useAuth();
  
  // The redirect logic is now handled globally by the AuthProvider.
  // No need for a useEffect here anymore.

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-3 mb-8">
            <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                <Eye className="w-8 h-8" />
            </div>
          <h1 className="text-3xl font-bold text-foreground">
            车险经营指标周趋势
          </h1>
        </div>
        {!isSupabaseConfigured && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4 text-center text-sm">
                后端服务未配置。请检查您的环境变量。
            </div>
        )}
        <AuthForm />
      </div>
    </div>
  );
}
