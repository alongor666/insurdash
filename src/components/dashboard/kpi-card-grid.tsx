"use client"

import KpiCard from './kpi-card';
import { KPI_GRID_LAYOUT, KPIS } from '@/lib/kpi-config';
import type { DashboardData } from '@/lib/types';

interface KpiCardGridProps {
  processedData: DashboardData;
}

export default function KpiCardGrid({ processedData }: KpiCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
      {KPI_GRID_LAYOUT.map((kpiId) => {
        if (!kpiId) return <div key={Math.random()} />; // Placeholder for empty grid cells
        
        const details = KPIS[kpiId];
        const currentData = processedData.summary.current.kpis[kpiId];
        const compareData = processedData.summary.compare.kpis[kpiId];

        return (
          <KpiCard
            key={kpiId}
            kpiId={kpiId}
            title={details.name}
            value={currentData}
            previousValue={compareData}
            unit={details.unit}
          />
        );
      })}
    </div>
  );
}
