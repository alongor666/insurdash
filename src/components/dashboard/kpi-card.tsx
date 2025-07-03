"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { formatKpiValue, getComparisonText } from '@/lib/data-utils';
import type { KpiKey } from '@/lib/types';

interface KpiCardProps {
  kpiId: KpiKey;
  title: string;
  value: number;
  previousValue: number;
  unit: '万元' | '%' | '件' | '' | '元';
}

export default function KpiCard({ kpiId, title, value, previousValue, unit }: KpiCardProps) {
  
  const { icon: ChangeIcon, text: changeText, color: changeColor } = getComparisonText(kpiId, value, previousValue);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatKpiValue(value, unit)}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1" style={{ color: changeColor }}>
          <ChangeIcon className="h-4 w-4" />
          {changeText}
        </p>
      </CardContent>
    </Card>
  );
}
