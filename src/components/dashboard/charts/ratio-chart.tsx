
"use client"

import { useState, useMemo } from 'react'
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { KPIS, DONUT_PARETO_KPI_IDS } from '@/lib/kpi-config';
import type { KpiKey, ProcessedBusinessData } from '@/lib/types';
import { CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatKpiValue } from '@/lib/data';
import { getDynamicColorForDonutLegend, getDynamicColorByVCR } from '@/lib/colors';

interface DonutChartProps {
    data: ProcessedBusinessData[];
}

const LegendTable = ({ data, innerMetric, outerMetric }: { data: any[], innerMetric: KpiKey | 'none', outerMetric: KpiKey | 'none' }) => {
    const totalInner = innerMetric !== 'none' ? data.reduce((sum, item) => sum + (item.kpis[innerMetric] || 0), 0) : 0;
    const totalOuter = outerMetric !== 'none' ? data.reduce((sum, item) => sum + (item.kpis[outerMetric] || 0), 0) : 0;

    const sortedData = data;

    return (
        <ScrollArea className="h-full">
            <Table className="text-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead className="h-8">业务线</TableHead>
                        {outerMetric !== 'none' && <TableHead className="text-right h-8">外环占比</TableHead>}
                        {innerMetric !== 'none' && <TableHead className="text-right h-8">内环占比</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map(item => {
                        const outerValue = outerMetric !== 'none' ? item.kpis[outerMetric] : 0;
                        const innerValue = innerMetric !== 'none' ? item.kpis[innerMetric] : 0;
                        const outerRatio = totalOuter > 0 ? (outerValue / totalOuter) * 100 : 0;
                        const innerRatio = totalInner > 0 ? (innerValue / totalInner) * 100 : 0;

                        return (
                            <TableRow key={item.business_type} className="h-8">
                                <TableCell className="py-1 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                    <span className="truncate">{item.business_type}</span>
                                </TableCell>
                                {outerMetric !== 'none' && 
                                    <TableCell className="py-1 text-right font-medium" style={{color: getDynamicColorForDonutLegend(outerRatio, innerRatio, 'outer')}}>
                                        {formatKpiValue(outerRatio, '%')}
                                    </TableCell>
                                }
                                 {innerMetric !== 'none' && 
                                    <TableCell className="py-1 text-right font-medium" style={{color: getDynamicColorForDonutLegend(outerRatio, innerRatio, 'inner')}}>
                                        {formatKpiValue(innerRatio, '%')}
                                    </TableCell>
                                }
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};


export default function DonutChart({ data }: DonutChartProps) {
    const [outerMetric, setOuterMetric] = useState<KpiKey | 'none'>('premium_written');
    const [innerMetric, setInnerMetric] = useState<KpiKey | 'none'>('total_loss_amount');
    
    const chartData = useMemo(() => {
        const sortedData = [...data].sort((a, b) => {
            if (outerMetric !== 'none') return b.kpis[outerMetric] - a.kpis[outerMetric];
            if (innerMetric !== 'none') return b.kpis[innerMetric] - a.kpis[innerMetric];
            return 0;
        });
        
        return sortedData.map(d => ({
            ...d,
            color: getDynamicColorByVCR(d.kpis.variable_cost_ratio)
        }));
    }, [data, outerMetric, innerMetric]);

    if (innerMetric === 'none' && outerMetric === 'none') {
        return (
            <div className="flex flex-col h-full">
                <FilterControls innerMetric={innerMetric} setInnerMetric={setInnerMetric} outerMetric={outerMetric} setOuterMetric={setOuterMetric} />
                <div className="flex-grow flex items-center justify-center text-muted-foreground">请至少选择一个指标</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
             <FilterControls innerMetric={innerMetric} setInnerMetric={setInnerMetric} outerMetric={outerMetric} setOuterMetric={setOuterMetric} />
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <div className="w-full h-[300px]">
                    <ResponsiveContainer>
                        <PieChart>
                             <Tooltip 
                                 content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        const { name, value, dataKey } = payload[0];
                                        const kpiKey = (dataKey as string).replace('kpis.', '') as KpiKey;
                                        const kpi = KPIS[kpiKey];
                                        
                                        if (!kpi) return null;
                                        
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <p className="text-sm font-bold text-foreground">{name}</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs text-muted-foreground">{kpi.name}</p>
                                                        <p className="text-xs font-medium ml-2">{formatKpiValue(value, kpi.unit)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                             />
                            {outerMetric !== 'none' && 
                                <Pie
                                    data={chartData}
                                    dataKey={`kpis.${outerMetric}`}
                                    nameKey="business_type"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={innerMetric !== 'none' ? "70%" : "40%"}
                                    outerRadius="90%"
                                    paddingAngle={1}
                                    isAnimationActive={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-outer-${index}`} fill={entry.color} stroke={entry.color} />
                                    ))}
                                </Pie>
                            }
                            {innerMetric !== 'none' &&
                                <Pie
                                    data={chartData}
                                    dataKey={`kpis.${innerMetric}`}
                                    nameKey="business_type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="60%"
                                    innerRadius="40%"
                                    paddingAngle={1}
                                    isAnimationActive={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-inner-${index}`} fill={entry.color} stroke={entry.color} />
                                    ))}
                                </Pie>
                            }
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="w-full h-[300px]">
                    <LegendTable data={chartData} innerMetric={innerMetric} outerMetric={outerMetric} />
                </div>
            </div>
        </div>
    )
}

const FilterControls = ({innerMetric, setInnerMetric, outerMetric, setOuterMetric}: any) => (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 space-y-1">
            <CardDescription>外环指标</CardDescription>
            <Select value={outerMetric} onValueChange={(val) => setOuterMetric(val as KpiKey | 'none')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="none">无</SelectItem>
                {DONUT_PARETO_KPI_IDS.map(kpi => (
                    <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex-1 space-y-1">
            <CardDescription>内环指标</CardDescription>
            <Select value={innerMetric} onValueChange={(val) => setInnerMetric(val as KpiKey | 'none')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="none">无</SelectItem>
                {DONUT_PARETO_KPI_IDS.map(kpi => (
                    <SelectItem key={kpi} value={kpi}>{KPIS[kpi].name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
    </div>
)
