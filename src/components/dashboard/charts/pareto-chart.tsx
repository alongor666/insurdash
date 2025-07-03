
"use client"

import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LabelList, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { DONUT_PARETO_KPI_IDS, KPIS } from '@/lib/kpi-config';
import type { KpiKey, ProcessedBusinessData } from '@/lib/types';
import { CardDescription } from '@/components/ui/card';
import { formatKpiValue } from '@/lib/data-utils';
import { getDynamicColorByVCR } from '@/lib/colors';

interface ParetoChartProps {
    data: ProcessedBusinessData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const kpi = KPIS[payload[0].dataKey as KpiKey];
        const paretoValue = payload[0].value;
        const cumulativeValue = payload[1].value;
        const vcr = payload[0].payload.kpis.variable_cost_ratio;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                 <p className="text-sm font-bold text-foreground">{label}</p>
                <div className="grid grid-cols-1 gap-2 mt-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{kpi.name}</p>
                        <p className="text-xs font-medium">{formatKpiValue(paretoValue, kpi.unit)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">累计占比</p>
                        <p className="text-xs font-medium">{formatKpiValue(cumulativeValue, '%')}</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['variable_cost_ratio'].name}</p>
                        <p className="text-xs font-medium" style={{color: getDynamicColorByVCR(vcr)}}>
                           {formatKpiValue(vcr, '%')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


export default function ParetoChart({ data }: ParetoChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premium_written');

    const paretoData = useMemo(() => {
        const sortedData = [...data].sort((a, b) => b.kpis[selectedKpi] - a.kpis[selectedKpi]);
        const total = sortedData.reduce((sum, item) => sum + item.kpis[selectedKpi], 0);
        
        let cumulative = 0;
        return sortedData.map(item => {
            cumulative += item.kpis[selectedKpi];
            return {
                ...item,
                cumulativePercentage: total > 0 ? (cumulative / total) * 100 : 0
            }
        });
    }, [data, selectedKpi]);

    const { name, unit } = KPIS[selectedKpi];

    const chartConfig = {
      [selectedKpi]: {
        label: name,
        color: "hsl(var(--chart-1))",
      },
      cumulativePercentage: {
        label: "累计占比",
        color: "hsl(var(--chart-2))",
      }
    }

    return (
        <div className="space-y-4">
            <div className="w-full sm:w-1/3">
                <CardDescription>选择主指标</CardDescription>
                <Select value={selectedKpi} onValueChange={(value) => setSelectedKpi(value as KpiKey)}>
                    <SelectTrigger>
                        <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                    {DONUT_PARETO_KPI_IDS.map(kpi => (
                        <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                    <ComposedChart data={paretoData} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="business_type" tick={{fontSize: 12}} tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis 
                            yAxisId="left" 
                            orientation="left" 
                            stroke="hsl(var(--chart-1))"
                            tickFormatter={(value) => formatKpiValue(value, unit, true)}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            stroke="hsl(var(--chart-2))"
                            tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey={`kpis.${selectedKpi}`}
                          name={name} 
                          radius={[4, 4, 0, 0]} 
                        >
                            {paretoData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getDynamicColorByVCR(entry.kpis.variable_cost_ratio)} />
                            ))}
                        </Bar>
                        <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="累计占比" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
