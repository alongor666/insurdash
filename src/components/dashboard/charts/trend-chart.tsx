
"use client"

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { KPIS } from '@/lib/kpi-config';
import type { KpiKey, TrendData } from '@/lib/types';
import { CardDescription } from '@/components/ui/card';
import { formatKpiValue } from '@/lib/data';
import { getDynamicColorByVCR } from '@/lib/colors';

interface TrendChartProps {
    data: TrendData[];
}

const chartableKpis = Object.keys(KPIS) as KpiKey[];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const mainKpi = KPIS[payload[0].dataKey as KpiKey];
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                    <p className="text-sm font-bold text-foreground">{dataPoint.period_label}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{mainKpi.name}</p>
                        <p className="text-xs font-medium">{formatKpiValue(dataPoint.kpis[mainKpi.id], mainKpi.unit)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['variable_cost_ratio'].name}</p>
                        <p className="text-xs font-medium" style={{color: getDynamicColorByVCR(dataPoint.kpis.variable_cost_ratio)}}>
                            {formatKpiValue(dataPoint.kpis.variable_cost_ratio, '%')}
                        </p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['marginal_contribution_amount'].name}</p>
                        <p className="text-xs font-medium">{formatKpiValue(dataPoint.kpis.marginal_contribution_amount, '万元')}</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


export default function TrendChart({ data }: TrendChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premium_written');
    const { unit, name, type } = KPIS[selectedKpi];
    const ChartComponent = type === 'ratio' || type === 'average' ? LineChart : BarChart;
    const ChartElement = type === 'ratio' || type === 'average' ? Line : Bar;

    const chartConfig = {
      [selectedKpi]: {
        label: name,
      },
    }

    return (
        <div className="space-y-4">
            <div className="w-full sm:w-1/3">
                <CardDescription>选择指标</CardDescription>
                <Select value={selectedKpi} onValueChange={(value) => setSelectedKpi(value as KpiKey)}>
                    <SelectTrigger>
                        <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                    {chartableKpis.map(kpi => (
                        <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                    <ChartComponent 
                        data={data} 
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="period_label" tickLine={false} tickMargin={10} axisLine={false} tick={{fontSize: 12}} />
                        <YAxis tickFormatter={(value) => formatKpiValue(value, unit, true)} />
                        <Tooltip
                            cursor={{fill: 'hsl(var(--muted))'}}
                            content={<CustomTooltip />}
                        />
                        <Legend />
                        <ChartElement 
                            dataKey={`kpis.${selectedKpi}`}
                            name={name}
                            stroke="hsl(var(--chart-1))"
                            radius={unit === '%' ? 0 : [4,4,0,0]}
                        >
                        {
                            (ChartElement === Bar) && data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getDynamicColorByVCR(entry.kpis.variable_cost_ratio)} />
                            ))
                        }
                        </ChartElement>
                    </ChartComponent>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
