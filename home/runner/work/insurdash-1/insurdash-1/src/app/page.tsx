
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '../hooks/use-auth';
import { DashboardContext, useDashboard } from '../hooks/use-dashboard';
import Header from '../components/dashboard/header';
import GlobalFilters from '../components/dashboard/global-filters';
import KpiCardGrid from '../components/dashboard/kpi-card-grid';
import ChartsSection from '../components/dashboard/charts-section';
import DataTable from '../components/dashboard/data-table';
import { getFilterOptions, getRawDataForPeriod, getRawDataForTrend, processDashboardData, processTrendData } from '../lib/data';
import type { DashboardState, AnalysisMode } from '../lib/types';
import { useToast } from "@/hooks/use-toast";

function DashboardContent() {
  const { loading, isReady, state } = useDashboard();

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
        {processedData ? (
          <>
            <KpiCardGrid processedData={processedData} />
            <ChartsSection processedData={processedData} trendData={trendData} />
            <DataTable processedData={processedData} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
            <p>没有可用于当前筛选的数据。</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

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
  
  // Effect for ONE-TIME initialization from URL params
  useEffect(() => {
    if (user && !isReady) {
      getFilterOptions().then(({ periods, businessTypes }) => {
        const urlCp = searchParams.get('cp');
        const urlPp = searchParams.get('pp');
        const urlMode = searchParams.get('mode') as AnalysisMode | null;
        const urlBl = searchParams.get('bl');

        const currentPeriod = urlCp || (periods[0]?.id ?? '');
        const comparePeriod = urlPp || (periods[1]?.id ?? '');
        const analysisMode = urlMode || 'ytd';
        const selectedBusinessTypes = urlBl ? urlBl.split(',') : businessTypes;
        
        setState(s => ({ ...s, periods, businessTypes, currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes }));
        setIsReady(true);
      });
    }
  }, [user, isReady, searchParams]); 

  // Effect for syncing STATE TO URL
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
    
    if (state.businessTypes.length > 0 && state.selectedBusinessTypes.length === state.businessTypes.length) {
        params.delete('bl');
    } else {
        params.set('bl', state.selectedBusinessTypes.join(','));
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isReady, state.currentPeriod, state.comparePeriod, state.analysisMode, state.selectedBusinessTypes, state.businessTypes, router, searchParams]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Effect for FETCHING DATA when state changes
  useEffect(() => {
    if (!isReady || !state.currentPeriod) return;
  
    setLoading(true);
    const fetchData = async () => {
      try {
        const { currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes, periods } = state;

        const currentPeriodIndex = periods.findIndex(p => p.id === currentPeriod);
        
        const prevPeriodId = (currentPeriodIndex > -1 && currentPeriodIndex + 1 < periods.length) ? periods[currentPeriodIndex + 1].id : undefined;
        const prev2PeriodId = (currentPeriodIndex > -1 && currentPeriodIndex + 2 < periods.length) ? periods[currentPeriodIndex + 2].id : undefined;

        const [
            currentRaw,
            prevCurrentRaw,
            prev2CurrentRaw,
            compareRaw,
            trendRaw,
        ] = await Promise.all([
            getRawDataForPeriod(currentPeriod),
            prevPeriodId ? getRawDataForPeriod(prevPeriodId) : Promise.resolve([]),
            prev2PeriodId ? getRawDataForPeriod(prev2PeriodId) : Promise.resolve([]),
            analysisMode === 'comparison' ? getRawDataForPeriod(comparePeriod) : Promise.resolve([]),
            getRawDataForTrend(currentPeriod, 15)
        ]);
        
        const processed = processDashboardData({
            currentPeriodRawData: currentRaw,
            comparePeriodRawData: compareRaw,
            prevCurrentPeriodRawData: prevCurrentRaw,
            prev2PeriodRawData: prev2CurrentRaw,
            selectedBusinessTypes,
            analysisMode
        });
        
        const processedTrendData = processTrendData(trendRaw, selectedBusinessTypes);
  
        setState(s => ({ ...s, processedData: processed, trendData: processedTrendData }));
      } catch (error) {
        console.error("Failed to fetch or process dashboard data:", error);
        toast({
            title: "数据加载失败",
            description: "无法加载新数据，请检查您的网络连接或稍后再试。",
            variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [isReady, state.currentPeriod, state.comparePeriod, state.selectedBusinessTypes, state.analysisMode, toast, state.periods]);
  
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
