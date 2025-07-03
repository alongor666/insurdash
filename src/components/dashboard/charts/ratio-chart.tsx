"use client"

import { useState } from 'react'
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { kpiDetails, type KpiKey, type BusinessLineData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RatioChartProps {
    data: BusinessLineData[];
}

const chartableKpis = (Object.keys(kpiDetails) as KpiKey[]).filter(key => kpiDetails[key].unit !== '%');

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(224, 64%, 72%)",
    "hsl(187, 95%, 83%)",
];

export default function RatioChart({ data }: RatioChartProps) {
    const [innerMetric, setInnerMetric] = useState<KpiKey>('premiumIncome');
    const [outerMetric, setOuterMetric] = useState<KpiKey>('newPolicies');

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
                    <label className="text-sm font-medium">内环指标</label>
                    <Select value={innerMetric} onValueChange={(val) => setInnerMetric(val as KpiKey)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">外环指标</label>
                    <Select value={outerMetric} onValueChange={(val) => setOuterMetric(val as KpiKey)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                         {chartableKpis.map(kpi => (
                            <SelectItem key={kpi} value={kpi}>{kpiDetails[kpi].name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                    <PieChart>
                        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data}
                            dataKey={innerMetric}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="60%"
                            innerRadius="40%"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
                            ))}
                        </Pie>
                        <Pie
                            data={data}
                            dataKey={outerMetric}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="90%"
                        >
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
                            ))}
                        </Pie>
                        <Legend content={({ payload }) => {
                            return (
                                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                {payload?.map((entry, index) => (
                                    <li key={`item-${index}`} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}} />
                                        <span className="text-sm text-muted-foreground">{entry.value}</span>
                                    </li>
                                ))}
                                </ul>
                            )
                        }}/>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    )
}
