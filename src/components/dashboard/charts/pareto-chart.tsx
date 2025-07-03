"use client"

import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { kpiDetails, type KpiKey, type BusinessLineData } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface ParetoChartProps {
    data: BusinessLineData[];
}

const chartableKpis = (Object.keys(kpiDetails) as KpiKey[]).filter(key => kpiDetails[key].unit !== '%');

export default function ParetoChart({ data }: ParetoChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premiumIncome');

    const paretoData = useMemo(() => {
        const sortedData = [...data].sort((a, b) => b[selectedKpi] - a[selectedKpi]);
        const total = sortedData.reduce((sum, item) => sum + item[selectedKpi], 0);
        
        let cumulative = 0;
        return sortedData.map(item => {
            cumulative += item[selectedKpi];
            return {
                ...item,
                cumulativePercentage: total > 0 ? (cumulative / total) * 100 : 0
            }
        });
    }, [data, selectedKpi]);

    const { name, unit } = kpiDetails[selectedKpi];

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
                <Label htmlFor="pareto-kpi" className="text-sm font-medium">选择主指标</Label>
                <Select value={selectedKpi} onValueChange={(value) => setSelectedKpi(value as KpiKey)}>
                    <SelectTrigger id="pareto-kpi">
                        <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                    {chartableKpis.map(kpi => (
                        <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                    <ComposedChart data={paretoData} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))"
                            tickFormatter={(value) => unit === '元' ? `${value/10000}万` : value.toLocaleString()}
                        />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))"
                             tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                        />
                        <Tooltip content={<ChartTooltipContent formatter={(value, name) => {
                             if (name === 'cumulativePercentage') {
                                return `${Number(value).toFixed(2)}%`
                             }
                             return (unit === '元') ? `¥${Number(value).toLocaleString()}` : Number(value).toLocaleString()
                        }} />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey={selectedKpi} name={name} fill="hsl(var(--chart-1))" radius={4} />
                        <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="累计占比" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
