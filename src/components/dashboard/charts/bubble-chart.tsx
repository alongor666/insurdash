
"use client"

import { useState } from 'react';
import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ZAxis, Label } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { KPIS } from '@/lib/kpi-config';
import type { KpiKey, ProcessedBusinessData } from '@/lib/types';
import { getDynamicColorByVCR } from '@/lib/colors';
import { formatKpiValue } from '@/lib/data';
import { CardDescription } from '@/components/ui/card';

interface BubbleChartProps {
    data: ProcessedBusinessData[];
}

const chartableKpis = Object.keys(KPIS) as KpiKey[];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const xKpi = KPIS[data.xKpi as KpiKey];
        const yKpi = KPIS[data.yKpi as KpiKey];
        const zKpi = KPIS[data.zKpi as KpiKey];

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                    <p className="text-sm font-bold text-foreground">{data.business_type}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{xKpi.name} (X)</p>
                        <p className="text-xs font-medium">{formatKpiValue(data.x, xKpi.unit)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{yKpi.name} (Y)</p>
                        <p className="text-xs font-medium">{formatKpiValue(data.y, yKpi.unit)}</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{zKpi.name} (大小)</p>
                        <p className="text-xs font-medium">{formatKpiValue(data.z, zKpi.unit)}</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{KPIS['variable_cost_ratio'].name}</p>
                        <p className="text-xs font-medium" style={{color: getDynamicColorByVCR(data.kpis.variable_cost_ratio)}}>
                            {formatKpiValue(data.kpis.variable_cost_ratio, '%')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};


export default function BubbleChart({ data }: BubbleChartProps) {
    const [xMetric, setXMetric] = useState<KpiKey>('marginal_contribution_ratio');
    const [yMetric, setYMetric] = useState<KpiKey>('premium_written');
    const [zMetric, setZMetric] = useState<KpiKey>('policy_count');

    const chartData = data.map(d => ({
        ...d,
        x: d.kpis[xMetric],
        y: d.kpis[yMetric],
        z: d.kpis[zMetric],
        xKpi: xMetric,
        yKpi: yMetric,
        zKpi: zMetric,
        fill: getDynamicColorByVCR(d.kpis.variable_cost_ratio),
    }));

    const xDetails = KPIS[xMetric];
    const yDetails = KPIS[yMetric];
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <CardDescription>X轴指标</CardDescription>
                    <Select value={xMetric} onValueChange={(val) => setXMetric(val as KpiKey)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <CardDescription>Y轴指标</CardDescription>
                    <Select value={yMetric} onValueChange={(val) => setYMetric(val as KpiKey)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                         {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <CardDescription>气泡大小</CardDescription>
                    <Select value={zMetric} onValueChange={(val) => setZMetric(val as KpiKey)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                         {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                         ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <ChartContainer config={{}} className="h-[450px] w-full">
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                        <CartesianGrid />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name={xDetails.name} 
                            tickFormatter={(value) => formatKpiValue(value, xDetails.unit, true)}
                            domain={['dataMin', 'dataMax']}
                        >
                            <Label value={xDetails.name} offset={-25} position="insideBottom" />
                        </XAxis>
                        <YAxis 
                            type="number" 
                            dataKey="y" 
                            name={yDetails.name} 
                            width={80}
                            tickFormatter={(value) => formatKpiValue(value, yDetails.unit, true)}
                            domain={['auto', 'auto']}
                        >
                            <Label value={yDetails.name} angle={-90} position="insideLeft" />
                        </YAxis>
                        <ZAxis type="number" dataKey="z" range={[100, 1000]} name={KPIS[zMetric].name} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter data={chartData} />
                    </ScatterChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
