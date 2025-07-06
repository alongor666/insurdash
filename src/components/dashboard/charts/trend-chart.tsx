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
import { useDashboard } from '@/hooks/use-dashboard';

interface TrendChartProps {
    data: TrendData[];
}

const chartableKpis = Object.keys(KPIS) as KpiKey[];

const CustomTooltip = ({ active, payload, label }: any) => {
    const { state } = useDashboard();
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const dataKey = payload[0].dataKey; // e.g., "ytd_kpis.premium_written"
        const [kpiSet, kpiKey] = dataKey.split('.') as ['ytd_kpis' | 'pop_kpis', KpiKey];
        const mainKpi = KPIS[kpiKey];
        if (!mainKpi) return null;

        const mainValue = dataPoint[kpiSet][kpiKey];
        const vcr = dataPoint[kpiSet].variable_cost_ratio;
        const contribution = dataPoint[kpiSet].marginal_contribution_amount;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                    <p className="text-sm font-bold text-foreground">{dataPoint.period_label}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{mainKpi.name} ({state.analysisMode === 'pop' ? '当周' : '累计'})</p>
                        <p className="text-xs font-medium">{formatKpiValue(mainValue, mainKpi.unit)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['variable_cost_ratio'].name} ({state.analysisMode === 'pop' ? '当周' : '累计'})</p>
                        <p className="text-xs font-medium" style={{color: getDynamicColorByVCR(vcr)}}>
                            {formatKpiValue(vcr, '%')}
                        </p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['marginal_contribution_amount'].name} ({state.analysisMode === 'pop' ? '当周' : '累计'})</p>
                        <p className="text-xs font-medium">{formatKpiValue(contribution, '万元')}</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


export default function TrendChart({ data }: TrendChartProps) {
    const { state: dashboardState } = useDashboard();
    const { analysisMode } = dashboardState;

    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premium_written');
    const { unit, name, type } = KPIS[selectedKpi];
    
    const kpiSetKey = analysisMode === 'ytd' ? 'ytd_kpis' : 'pop_kpis';
    const dataKey = `${kpiSetKey}.${selectedKpi}`;

    const chartConfig = {
      [dataKey]: {
        label: name,
      },
    }
    
    const chartProps = {
        data: data, 
        margin: { top: 20, right: 20, bottom: 20, left: 20 }
    };
    
    const commonChartElements = (
        <>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period_label" tickLine={false} tickMargin={10} axisLine={false} tick={{fontSize: 12}} />
            <YAxis tickFormatter={(value) => formatKpiValue(value, unit, true)} />
            <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<CustomTooltip />}
            />
            <Legend />
        </>
    );

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
                    {type === 'ratio' || type === 'average' ? (
                         <LineChart {...chartProps}>
                            {commonChartElements}
                            <Line 
                                type="monotone"
                                dataKey={dataKey}
                                name={name}
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    ) : (
                         <BarChart {...chartProps}>
                            {commonChartElements}
                            <Bar 
                                dataKey={dataKey}
                                name={name}
                                radius={[4, 4, 0, 0]}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getDynamicColorByVCR(entry[kpiSetKey].variable_cost_ratio)} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
