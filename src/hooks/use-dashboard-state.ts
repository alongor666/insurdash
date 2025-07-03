"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getFilterOptions, getRawDataForPeriod, getRawDataForTrend } from '@/lib/data';
import { processDashboardData } from '@/lib/data-utils';
import type { DashboardState, AnalysisMode } from '@/lib/types';

interface DashboardActions {
  setPeriod: (periodId: string) => void;
  setComparePeriod: (periodId: string) => void;
  setAnalysisMode: (mode: AnalysisMode) => void;
  setSelectedBusinessTypes: (types: string[]) => void;
}

interface DashboardContextValue {
  state: DashboardState;
  actions: DashboardActions;
  loading: boolean;
  isReady: boolean;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const DashboardStateProvider = ({ children }: { children: ReactNode }) => {
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
  const [isReady, setIsReady] = useState(false); // To prevent rendering with incomplete state

  // Initialize state from URL or defaults
  useEffect(() => {
    setLoading(true);
    getFilterOptions().then(({ periods, businessTypes }) => {
      const currentPeriod = searchParams.get('cp') || (periods[0]?.id ?? '');
      const comparePeriod = searchParams.get('pp') || (periods[1]?.id ?? '');
      const analysisMode = (searchParams.get('mode') as AnalysisMode) || 'ytd';
      const selectedBusinessTypes = searchParams.get('bl')?.split(',') || businessTypes;
      
      setState(s => ({ ...s, periods, businessTypes, currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes }));
      setIsReady(true);
    });
  }, []); // Only on mount

  // Update URL from state
  const updateURL = useCallback(() => {
    if (!isReady) return;
    const params = new URLSearchParams();
    params.set('cp', state.currentPeriod);
    params.set('pp', state.comparePeriod);
    params.set('mode', state.analysisMode);
    params.set('bl', state.selectedBusinessTypes.join(','));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [isReady, state.currentPeriod, state.comparePeriod, state.analysisMode, state.selectedBusinessTypes, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);


  // Fetch and process data when dependencies change
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
        
        const processedTrendData = trendRaw.map(periodData => {
            const processedPeriod = processDashboardData(periodData.current, periodData.previous, state.selectedBusinessTypes, state.analysisMode);
            return {
                period_id: periodData.period_id,
                period_label: periodData.period_label,
                kpis: processedPeriod.summary.current.kpis
            }
        });
        
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


  const actions: DashboardActions = {
    setPeriod: (periodId) => setState(s => ({ ...s, currentPeriod: periodId })),
    setComparePeriod: (periodId) => setState(s => ({ ...s, comparePeriod: periodId })),
    setAnalysisMode: (mode) => setState(s => ({ ...s, analysisMode: mode })),
    setSelectedBusinessTypes: (types) => setState(s => ({ ...s, selectedBusinessTypes: types })),
  };

  return (
    <DashboardContext.Provider value={{ state, actions, loading, isReady }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardState must be used within a DashboardStateProvider');
  }
  const { state, actions } = context;
  return {
    state,
    ...actions,
    loading: context.loading,
    isReady: context.isReady,
  };
};
