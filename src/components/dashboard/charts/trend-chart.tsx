"use client"

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { kpiDetails, type KpiKey, type BusinessLineData } from '@/lib/types';

interface TrendChartProps {
    data: BusinessLineData[];
}

const chartableKpis = (Object.keys(kpiDetails) as KpiKey[]);

export default function TrendChart({ data }: TrendChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premiumIncome');
    const { unit, name } = kpiDetails[selectedKpi];
    const ChartComponent = unit === '%' ? LineChart : BarChart;
    const ChartElement = unit === '%' ? Line : Bar;

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
                    <ChartComponent data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickFormatter={(value) => unit === '元' ? `${value/10000}万` : unit === '%' ? `${value}%` : value} />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator={unit === '%' ? 'dot' : 'line'} />}
                        />
                        <Legend />
                        <ChartElement dataKey={selectedKpi} name={name} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" radius={unit === '%' ? 0 : 4} />
                    </ChartComponent>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
