"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(6, { message: '密码至少需要6个字符' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthForm() {
  const { login, isSupabaseConfigured } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    const { error } = await login(values.email, values.password);

    if (error) {
      toast({
        title: '登录失败',
        description: error.message || '请检查您的邮箱和密码。',
        variant: 'destructive',
      });
    } else {
      toast({
        title: '登录成功',
        description: '正在跳转到仪表盘...',
      });
      // The redirect is handled by the auth provider
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>欢迎回来</CardTitle>
        <CardDescription>
          {isSupabaseConfigured
            ? '请输入您的凭据以访问仪表盘。'
            : '登录功能已禁用，服务未配置。'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
              disabled={loading || !isSupabaseConfigured}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              disabled={loading || !isSupabaseConfigured}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading || !isSupabaseConfigured}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {loading ? "登录中..." : !isSupabaseConfigured ? "服务未配置" : "登录"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
