"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

import Header from '@/components/dashboard/header';
import GlobalFilters from '@/components/dashboard/global-filters';
import KpiCardGrid from '@/components/dashboard/kpi-card-grid';
import ChartsSection from '@/components/dashboard/charts-section';
import DataTable from '@/components/dashboard/data-table';
import { Loader2 } from 'lucide-react';

import { MOCK_PERIODS, MOCK_BUSINESS_LINES } from '@/lib/mock-data';
import type { PeriodData, BusinessLineData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state derived from URL
  const currentPeriodId = searchParams.get('cp') || MOCK_PERIODS[0].id;
  const comparePeriodId = searchParams.get('pp') || MOCK_PERIODS[1].id;
  const analysisMode = searchParams.get('mode') || 'ytd';
  const selectedBusinessLines = searchParams.get('bl')?.split(',') || MOCK_BUSINESS_LINES.map(bl => bl.id);

  useEffect(() => {
    // If supabase is not configured, run in offline mode
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const filteredData = useMemo(() => {
    const period = MOCK_PERIODS.find(p => p.id === currentPeriodId);
    if (!period) return [];
    return period.data.filter(d => selectedBusinessLines.includes(d.id));
  }, [currentPeriodId, selectedBusinessLines]);

  const compareData = useMemo(() => {
    const period = MOCK_PERIODS.find(p => p.id === comparePeriodId);
     if (!period) return [];
    return period.data.filter(d => selectedBusinessLines.includes(d.id));
  }, [comparePeriodId, selectedBusinessLines]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header user={user} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <GlobalFilters />
        <KpiCardGrid currentData={filteredData} compareData={compareData} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="lg:col-span-2 xl:col-span-3">
                <ChartsSection data={filteredData} />
            </div>
        </div>
        <DataTable data={filteredData} />
      </main>
    </div>
  );
}
