"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { DashboardContext, useDashboard } from '@/hooks/use-dashboard';
import Header from '@/components/dashboard/header';
import GlobalFilters from '@/components/dashboard/global-filters';
import KpiCardGrid from '@/components/dashboard/kpi-card-grid';
import ChartsSection from '@/components/dashboard/charts-section';
import DataTable from '@/components/dashboard/data-table';
import { getFilterOptions, getRawDataForPeriod, getRawDataForTrend, processDashboardData, processTrendData } from '@/lib/data';
import type { DashboardState, AnalysisMode } from '@/lib/types';

function DashboardContent() {
  const { state, loading, isReady } = useDashboard();

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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<DashboardState>({
    periods: [],
    businessTypes: [],
    currentPeriod: '',
    comparePeriod: '',
    analysisMode: 'ytd',
    selectedBusinessTypes: [],
    processedData: null,
    trendData: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (user) {
      setLoading(true);
      getFilterOptions().then(({ periods, businessTypes }) => {
        const currentPeriod = searchParams.get('cp') || (periods[0]?.id ?? '');
        const comparePeriod = searchParams.get('pp') || (periods[1]?.id ?? '');
        const analysisMode = (searchParams.get('mode') as AnalysisMode) || 'ytd';
        const selectedBusinessTypes = searchParams.get('bl')?.split(',') || businessTypes;
        
        setState(s => ({ ...s, periods, businessTypes, currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes }));
        setIsReady(true);
      });
    }
  }, [user, searchParams]);

  const updateURL = useCallback(() => {
    if (!isReady) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('cp', state.currentPeriod);
    params.set('pp', state.comparePeriod);
    params.set('mode', state.analysisMode);
    params.set('bl', state.selectedBusinessTypes.join(','));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isReady, state.currentPeriod, state.comparePeriod, state.analysisMode, state.selectedBusinessTypes, router, searchParams]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  useEffect(() => {
    if (!isReady || !state.currentPeriod || !state.comparePeriod) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const [currentRaw, compareRaw, trendRaw] = await Promise.all([
          getRawDataForPeriod(state.currentPeriod),
          getRawDataForPeriod(state.comparePeriod),
          getRawDataForTrend(state.currentPeriod, 15)
        ]);

        const processed = processDashboardData(currentRaw, compareRaw, state.selectedBusinessTypes, state.analysisMode);
        const processedTrendData = processTrendData(trendRaw, state.selectedBusinessTypes, state.analysisMode);
        
        setState(s => ({ ...s, processedData: processed, trendData: processedTrendData }));
      } catch (error) {
        console.error("Failed to fetch or process dashboard data:", error);
        setState(s => ({ ...s, processedData: null, trendData: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isReady, state.currentPeriod, state.comparePeriod, state.selectedBusinessTypes, state.analysisMode]);
  
  const actions = {
    setPeriod: (periodId: string) => setState(s => ({ ...s, currentPeriod: periodId })),
    setComparePeriod: (periodId) => setState(s => ({ ...s, comparePeriod: periodId })),
    setAnalysisMode: (mode: AnalysisMode) => setState(s => ({ ...s, analysisMode: mode })),
    setSelectedBusinessTypes: (types: string[]) => setState(s => ({ ...s, selectedBusinessTypes: types })),
  };

  return (
    <DashboardContext.Provider value={{ state, actions, loading, isReady }}>
      <DashboardContent />
    </DashboardContext.Provider>
  );
}
