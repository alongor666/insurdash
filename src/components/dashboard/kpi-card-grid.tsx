"use client"

import KpiCard from './kpi-card';
import { kpiDetails, type BusinessLineData, type KpiKey } from '@/lib/types';
import { useMemo } from 'react';

interface KpiCardGridProps {
  currentData: BusinessLineData[];
  compareData: BusinessLineData[];
}

// Helper to safely sum values
const sum = (data: BusinessLineData[], key: KpiKey) => 
  data.reduce((acc, item) => acc + (item[key] || 0), 0);

// Helper to calculate weighted average for percentages
const weightedAverage = (data: BusinessLineData[], key: KpiKey, weightKey: KpiKey = 'premiumIncome') => {
    const totalWeight = sum(data, weightKey);
    if (totalWeight === 0) return 0;
    const weightedSum = data.reduce((acc, item) => acc + (item[key] || 0) * (item[weightKey] || 0), 0);
    return weightedSum / totalWeight;
};

export default function KpiCardGrid({ currentData, compareData }: KpiCardGridProps) {
    
    const aggregatedData = useMemo(() => {
        return Object.keys(kpiDetails).reduce((acc, key) => {
            const k = key as KpiKey;
            const { unit } = kpiDetails[k];
            if (unit === '%') {
                acc[k] = {
                    current: weightedAverage(currentData, k),
                    compare: weightedAverage(compareData, k),
                };
            } else {
                 acc[k] = {
                    current: sum(currentData, k),
                    compare: sum(compareData, k),
                };
            }
            return acc;
        }, {} as Record<KpiKey, { current: number, compare: number }>);

    }, [currentData, compareData]);


  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
      {(Object.keys(kpiDetails) as KpiKey[]).slice(0, 16).map((key) => {
        const details = kpiDetails[key];
        const data = aggregatedData[key];
        return (
          <KpiCard
            key={key}
            title={details.name}
            value={data.current}
            previousValue={data.compare}
            unit={details.unit}
          />
        );
      })}
    </div>
  );
}
