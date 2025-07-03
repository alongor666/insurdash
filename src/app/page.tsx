"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardStateProvider, useDashboardState } from '@/hooks/use-dashboard-state';

import Header from '@/components/dashboard/header';
import GlobalFilters from '@/components/dashboard/global-filters';
import KpiCardGrid from '@/components/dashboard/kpi-card-grid';
import ChartsSection from '@/components/dashboard/charts-section';
import DataTable from '@/components/dashboard/data-table';
import { processDashboardData } from '@/lib/data-utils';
import { getFilterOptions, getRawDataForPeriod } from '@/lib/data';

function DashboardContent() {
  const { state, loading, isReady } = useDashboardState();

  if (loading || !isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const {
    periods,
    businessTypes,
    processedData,
    trendData,
  } = state;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <GlobalFilters periods={periods} businessTypes={businessTypes} />
        {processedData && <KpiCardGrid processedData={processedData} />}
        {processedData && <ChartsSection processedData={processedData} trendData={trendData} />}
        {processedData && <DataTable processedData={processedData} />}
      </main>
    </div>
  );
}


export default function DashboardPage() {
  const { user, loading, isSupabaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardStateProvider>
      <DashboardContent />
    </DashboardStateProvider>
  );
}
