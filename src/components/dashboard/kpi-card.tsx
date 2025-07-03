"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  unit: '%' | '元' | '件' | '';
}

export default function KpiCard({ title, value, previousValue, unit }: KpiCardProps) {
  const change = previousValue !== 0 ? ((value - previousValue) / Math.abs(previousValue)) * 100 : 0;
  const isInfiniteChange = previousValue === 0 && value !== 0;

  const formatValue = (val: number) => {
    if (unit === '%') {
      return `${val.toFixed(2)}%`;
    }
    if (unit === '元') {
      return `¥${(val / 10000).toFixed(2)}万`;
    }
    return val.toLocaleString();
  };
  
  const getChangeIndicator = () => {
    if (isInfiniteChange || Math.abs(change) < 0.01) {
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (change > 0) {
        return <ArrowUpRight className="h-4 w-4 text-accent" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-destructive" />;
  };

  const getChangeText = () => {
      if(isInfiniteChange) return <span className="text-muted-foreground">N/A</span>
      if (Math.abs(change) < 0.01) return <span className="text-muted-foreground">0.00%</span>
      return <span className={change > 0 ? "text-accent" : "text-destructive"}>{change.toFixed(2)}%</span>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getChangeIndicator()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {getChangeText()} vs 对比周期
        </p>
      </CardContent>
    </Card>
  );
}
