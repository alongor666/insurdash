
"use client"

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { KPIS } from '@/lib/kpi-config';
import type { KpiKey, ProcessedBusinessData } from '@/lib/types';
import { CardDescription } from '@/components/ui/card';
import { getDynamicColorByVCR } from '@/lib/colors';
import { formatKpiValue } from '@/lib/data';


interface RankingChartProps {
    data: ProcessedBusinessData[];
}

const chartableKpis = Object.keys(KPIS) as KpiKey[];

export default function RankingChart({ data }: RankingChartProps) {
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('premium_written');
    const { unit, name } = KPIS[selectedKpi];
    
    const sortedData = [...data].sort((a, b) => b.kpis[selectedKpi] - a.kpis[selectedKpi]);

    return (
        <div className="space-y-4">
            <div className="w-full sm:w-1/3">
                <CardDescription>选择排名指标</CardDescription>
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
            <div style={{ height: `${sortedData.length * 35 + 50}px`, width: '100%' }}>
                <ResponsiveContainer>
                    <BarChart data={sortedData} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 30 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis 
                            dataKey="business_type" 
                            type="category"
                            width={100}
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fontSize: 12 }}
                        />
                        <XAxis type="number" hide />
                        <Tooltip
                             cursor={{ fill: 'hsl(var(--muted))' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0];
                                    const kpi = KPIS[item.dataKey?.toString().replace('kpis.', '') as KpiKey];
                                    const vcr = item.payload.kpis.variable_cost_ratio;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <p className="text-sm font-bold text-foreground">{label}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">{kpi.name}</p>
                                                <p className="text-xs font-medium ml-4">{formatKpiValue(item.value as number, kpi.unit)}</p>
                                            </div>
                                             <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">{KPIS['variable_cost_ratio'].name}</p>
                                                <p className="text-xs font-medium ml-4" style={{color: getDynamicColorByVCR(vcr)}}>
                                                   {formatKpiValue(vcr, '%')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey={`kpis.${selectedKpi}`} name={name} radius={[0, 4, 4, 0]}>
                             {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getDynamicColorByVCR(entry.kpis.variable_cost_ratio)} />
                            ))}
                            <LabelList 
                                dataKey={`kpis.${selectedKpi}`} 
                                position="right"
                                offset={10}
                                className="fill-foreground"
                                formatter={(value: number) => formatKpiValue(value, unit)}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
