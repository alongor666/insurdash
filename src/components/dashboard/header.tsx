"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { BarChart3, LogOut, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const { user, logout, isSupabaseConfigured } = useAuth();
  
  const getInitials = (email?: string) => {
    if (!email) return '?';
    return email[0].toUpperCase();
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-sm px-4 md:px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-md text-primary-foreground">
            <Eye className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground hidden sm:block">车险经营指标周趋势</h1>
      </div>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" disabled={!isSupabaseConfigured}>
              <Avatar>
                <AvatarImage src={`https://placehold.co/32x32.png`} data-ai-hint="profile avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || '未登录'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout} 
              disabled={!isSupabaseConfigured || !user}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
