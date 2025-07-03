"use client"

import { useState } from 'react';
import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ZAxis, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { kpiDetails, type KpiKey, type BusinessLineData } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface BubbleChartProps {
    data: BusinessLineData[];
}

const chartableKpis = (Object.keys(kpiDetails) as KpiKey[]);

const COLORS = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(224, 64%, 72%)",
    "hsl(187, 95%, 83%)",
];

export default function BubbleChart({ data }: BubbleChartProps) {
    const [xMetric, setXMetric] = useState<KpiKey>('payoutRate');
    const [yMetric, setYMetric] = useState<KpiKey>('comprehensiveCostRate');
    const [zMetric, setZMetric] = useState<KpiKey>('premiumIncome');

    const chartData = data.map(d => ({
        ...d,
        x: d[xMetric],
        y: d[yMetric],
        z: d[zMetric],
    }));

    const xDetails = kpiDetails[xMetric];
    const yDetails = kpiDetails[yMetric];
    
    const chartConfig = data.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: COLORS[index % COLORS.length]
        };
        return acc;
    }, {} as any)
    
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <Label htmlFor="x-axis" className="text-sm font-medium">X轴指标</Label>
                    <Select value={xMetric} onValueChange={(val) => setXMetric(val as KpiKey)}>
                        <SelectTrigger id="x-axis"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-1">
                    <Label htmlFor="y-axis" className="text-sm font-medium">Y轴指标</Label>
                    <Select value={yMetric} onValueChange={(val) => setYMetric(val as KpiKey)}>
                        <SelectTrigger id="y-axis"><SelectValue /></SelectTrigger>
                        <SelectContent>
                         {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-1">
                    <Label htmlFor="z-axis" className="text-sm font-medium">气泡大小指标</Label>
                    <Select value={zMetric} onValueChange={(val) => setZMetric(val as KpiKey)}>
                        <SelectTrigger id="z-axis"><SelectValue /></SelectTrigger>
                        <SelectContent>
                         {chartableKpis.map(kpi => (
                            (kpiDetails[kpi].unit !== '%') && <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                         ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <ChartContainer config={chartConfig} className="h-[450px] w-full">
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                        <CartesianGrid />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name={xDetails.name} 
                            label={{ value: xDetails.name, position: 'insideBottom', offset: -25 }}
                            tickFormatter={(value) => xDetails.unit === '%' ? `${Number(value).toFixed(1)}%` : value.toLocaleString()}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="y" 
                            name={yDetails.name} 
                            width={80}
                            label={{ value: yDetails.name, angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => yDetails.unit === '%' ? `${Number(value).toFixed(1)}%` : value.toLocaleString()}
                        />
                        <ZAxis type="number" dataKey="z" range={[60, 800]} name={kpiDetails[zMetric].name} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent nameKey="name" />} />
                        <Legend content={({ payload }) => {
                            const chartPayload = (payload as any)?.[0]?.payload?.payload
                            if (!chartPayload) return null
                            return (
                                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                {chartPayload.map((entry: any) => (
                                    <li key={`item-${entry.id}`} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: chartConfig[entry.name]?.color}} />
                                        <span className="text-sm text-muted-foreground">{entry.name}</span>
                                    </li>
                                ))}
                                </ul>
                            )
                        }}/>
                        <Scatter data={chartData} nameKey="name">
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.id}`} fill={chartConfig[entry.name].color} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
