"use client"

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { kpiDetails, type KpiKey, type BusinessLineData } from '@/lib/types';

interface RankingChartProps {
    data: BusinessLineData[];
}

const chartableKpis = (Object.keys(kpiDetails) as KpiKey[]);

export default function RankingChart({ data }: RankingChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premiumIncome');
    const { unit, name } = kpiDetails[selectedKpi];
    
    const sortedData = [...data].sort((a, b) => b[selectedKpi] - a[selectedKpi]);

    const chartConfig = {
      [selectedKpi]: {
        label: name,
      },
    }

    return (
        <div className="space-y-4">
            <div className="w-full sm:w-1/4">
                <Select value={selectedKpi} onValueChange={(value) => setSelectedKpi(value as KpiKey)}>
                    <SelectTrigger>
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
                    <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 30 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis 
                            dataKey="name" 
                            type="category"
                            width={80}
                            tickLine={false} 
                            axisLine={false}
                        />
                        <XAxis type="number" hide />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey={selectedKpi} name={name} fill="hsl(var(--chart-1))" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
