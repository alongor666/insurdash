
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
import type { DashboardState, AnalysisMode, RawBusinessData } from '@/lib/types';

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
    if (state.analysisMode === 'comparison') {
        params.set('pp', state.comparePeriod);
    } else {
        params.delete('pp');
    }
    params.set('mode', state.analysisMode);
    params.set('bl', state.selectedBusinessTypes.join(','));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isReady, state.currentPeriod, state.comparePeriod, state.analysisMode, state.selectedBusinessTypes, router, searchParams]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  useEffect(() => {
    if (!isReady || !state.currentPeriod) return;
  
    setLoading(true);
    const fetchData = async () => {
      try {
        const { currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes, periods } = state;

        // Determine all unique period IDs we need to fetch
        const neededPeriodIds = new Set<string>();
        neededPeriodIds.add(currentPeriod);
        
        const currentPeriodIndex = periods.findIndex(p => p.id === currentPeriod);

        // For 'ytd' and 'pop', we need the previous period
        if (analysisMode !== 'comparison' && currentPeriodIndex > -1 && currentPeriodIndex + 1 < periods.length) {
            neededPeriodIds.add(periods[currentPeriodIndex + 1].id);
        }
        
        // For 'pop', we need the period before the previous one
        if (analysisMode === 'pop' && currentPeriodIndex > -1 && currentPeriodIndex + 2 < periods.length) {
            neededPeriodIds.add(periods[currentPeriodIndex + 2].id);
        }
        
        // For 'comparison', we need the selected compare period and its predecessor
        if (analysisMode === 'comparison') {
            neededPeriodIds.add(comparePeriod);
            const comparePeriodIndex = periods.findIndex(p => p.id === comparePeriod);
            if (comparePeriodIndex > -1 && comparePeriodIndex + 1 < periods.length) {
                neededPeriodIds.add(periods[comparePeriodIndex + 1].id);
            }
        }
        
        const trendRawPromise = getRawDataForTrend(currentPeriod, 15);

        // Fetch all needed periods at once
        const allPeriodData: Record<string, RawBusinessData[]> = {};
        const fetchPromises = Array.from(neededPeriodIds).map(id => 
            getRawDataForPeriod(id).then(data => { allPeriodData[id] = data; })
        );

        await Promise.all([...fetchPromises, trendRawPromise]);
        
        const trendRaw = await trendRawPromise;

        const processed = processDashboardData({
            allPeriodData,
            currentPeriodId: currentPeriod,
            comparePeriodId: comparePeriod,
            analysisMode,
            selectedBusinessTypes,
            periods
        });

        const processedTrendData = processTrendData(trendRaw, selectedBusinessTypes);
  
        setState(s => ({ ...s, processedData: processed, trendData: processedTrendData }));
      } catch (error) {
        console.error("Failed to fetch or process dashboard data:", error);
        setState(s => ({ ...s, processedData: null, trendData: [] }));
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [isReady, state.currentPeriod, state.comparePeriod, state.selectedBusinessTypes, state.analysisMode, state.periods]);
  
  const actions = {
    setPeriod: (periodId: string) => setState(s => ({ ...s, currentPeriod: periodId })),
    setComparePeriod: (periodId: string) => setState(s => ({ ...s, comparePeriod: periodId })),
    setAnalysisMode: (mode: AnalysisMode) => setState(s => ({ ...s, analysisMode: mode })),
    setSelectedBusinessTypes: (types: string[]) => setState(s => ({ ...s, selectedBusinessTypes: types })),
  };

  return (
    <DashboardContext.Provider value={{ state, actions, loading, isReady }}>
      <DashboardContent />
    </DashboardContext.Provider>
  );
}
