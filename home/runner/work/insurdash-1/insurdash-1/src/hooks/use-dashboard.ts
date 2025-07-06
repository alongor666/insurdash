
"use client";

import { createContext, useContext } from 'react';
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
  isReady: boolean;
}

export const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
