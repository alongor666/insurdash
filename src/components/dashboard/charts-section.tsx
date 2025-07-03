"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TrendChart from "./charts/trend-chart"
import RatioChart from "./charts/ratio-chart"
import RankingChart from "./charts/ranking-chart"
import BubbleChart from "./charts/bubble-chart"
import ParetoChart from "./charts/pareto-chart"
import type { BusinessLineData } from "@/lib/types"

interface ChartsSectionProps {
    data: BusinessLineData[];
}

export default function ChartsSection({ data }: ChartsSectionProps) {
  return (
    <Tabs defaultValue="trend">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="trend">趋势分析</TabsTrigger>
            <TabsTrigger value="ratio">占比分析</TabsTrigger>
            <TabsTrigger value="ranking">业务排名</TabsTrigger>
            <TabsTrigger value="bubble">多维气泡</TabsTrigger>
            <TabsTrigger value="pareto">帕累托</TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
            <Card>
                <CardHeader>
                    <CardTitle>趋势分析</CardTitle>
                    <CardDescription>选择指标，查看各业务线趋势。</CardDescription>
                </CardHeader>
                <CardContent>
                    <TrendChart data={data} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="ratio">
            <Card>
                 <CardHeader>
                    <CardTitle>占比分析</CardTitle>
                    <CardDescription>内外双环设计，洞察结构性占比关系。</CardDescription>
                </CardHeader>
                <CardContent>
                    <RatioChart data={data} />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="ranking">
            <Card>
                 <CardHeader>
                    <CardTitle>业务排名</CardTitle>
                    <CardDescription>按不同指标对业务线进行排名。</CardDescription>
                </CardHeader>
                <CardContent>
                    <RankingChart data={data} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="bubble">
            <Card>
                 <CardHeader>
                    <CardTitle>多维气泡图</CardTitle>
                    <CardDescription>自定义X轴、Y轴和气泡大小，探索多指标关联。</CardDescription>
                </CardHeader>
                <CardContent>
                    <BubbleChart data={data} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="pareto">
            <Card>
                 <CardHeader>
                    <CardTitle>帕累托分析 (80/20法则)</CardTitle>
                    <CardDescription>识别贡献最大的关键业务线。</CardDescription>
                </CardHeader>
                <CardContent>
                    <ParetoChart data={data} />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  )
}
