"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { formatKpiValue, getComparisonMetrics } from '@/lib/data';
import type { KpiKey } from '@/lib/types';

interface KpiCardProps {
  kpiId: KpiKey;
  title: string;
  value: number;
  previousValue: number;
  unit: '万元' | '%' | '件' | '' | '元';
}

export default function KpiCard({ kpiId, title, value, previousValue, unit }: KpiCardProps) {
  
  const { diff, percentageChange, isBetter, isZero, isNew } = getComparisonMetrics(kpiId, value, previousValue);

  let ChangeIcon;
  let changeText;
  let changeColor;

  if (isZero) {
    ChangeIcon = Minus;
    changeText = "无变化";
    changeColor = "hsl(var(--muted-foreground))";
  } else if (isNew) {
    ChangeIcon = ArrowUp;
    changeText = "新增";
    changeColor = "hsl(var(--accent))";
  } else {
    ChangeIcon = isBetter ? ArrowUp : ArrowDown;
    changeColor = isBetter ? 'hsl(140, 80%, 40%)' : 'hsl(0, 80%, 50%)';
    if (unit === '%') {
        changeText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} p.p. (${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`;
    } else {
        changeText = `${formatKpiValue(diff, unit)} (${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`;
    }
  }


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
