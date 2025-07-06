
"use client"

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Label } from "recharts"
import { ChartContainer } from '@/components/ui/chart';
import { KPIS } from '@/lib/kpi-config';
import type { KpiKey, TrendData } from '@/lib/types';
import { formatKpiValue } from '@/lib/data';

interface ContributionChartProps {
    data: TrendData[];
    kpi1: KpiKey;
    kpi2: KpiKey;
}

const safeDivide = (numerator: number, denominator: number) => {
    return denominator !== 0 ? (numerator / denominator) * 100 : 0;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const kpi1 = payload.find((p: any) => p.dataKey === 'kpi1Share');
        const kpi2 = payload.find((p: any) => p.dataKey === 'kpi2Share');

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <div className="grid grid-cols-1 gap-2 mt-2">
                    {kpi1 && (
                         <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: kpi1.stroke}}></span>
                                {kpi1.name}
                            </p>
                            <p className="text-xs font-medium">{formatKpiValue(kpi1.value, '%')}</p>
                        </div>
                    )}
                     {kpi2 && (
                         <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: kpi2.stroke}}></span>
                                {kpi2.name}
                            </p>
                            <p className="text-xs font-medium">{formatKpiValue(kpi2.value, '%')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};


export default function ContributionChart({ data, kpi1, kpi2 }: ContributionChartProps) {
    const chartData = useMemo(() => {
        return data.map(d => ({
            period_label: d.period_label,
            kpi1Share: safeDivide(d.pop_kpis[kpi1], d.ytd_kpis[kpi1]),
            kpi2Share: safeDivide(d.pop_kpis[kpi2], d.ytd_kpis[kpi2]),
        }));
    }, [data, kpi1, kpi2]);

    const kpi1Name = KPIS[kpi1].name;
    const kpi2Name = KPIS[kpi2].name;

    const chartConfig = {
      kpi1Share: {
        label: kpi1Name,
        color: "hsl(var(--chart-1))",
      },
      kpi2Share: {
        label: kpi2Name,
        color: "hsl(var(--chart-2))",
      }
    }
    
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="period_label" tickLine={false} tickMargin={10} axisLine={false} tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                        type="monotone"
                        dataKey="kpi1Share"
                        name={kpi1Name}
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                     <Line 
                        type="monotone"
                        dataKey="kpi2Share"
                        name={kpi2Name}
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
