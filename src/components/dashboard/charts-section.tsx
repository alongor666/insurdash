"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TrendChart from "./charts/trend-chart"
import DonutChart from "./charts/ratio-chart"
import RankingChart from "./charts/ranking-chart"
import BubbleChart from "./charts/bubble-chart"
import ParetoChart from "./charts/pareto-chart"
import type { DashboardData, TrendData } from "@/lib/types"
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AiAnalysisModal from "./ai-analysis-modal";
import { generateAiAnalysisText } from "@/lib/ai-text-generator";
import { useDashboard } from "@/hooks/use-dashboard";

interface ChartsSectionProps {
    processedData: DashboardData;
    trendData: TrendData[];
}

type ChartTab = "trend" | "donut" | "ranking" | "bubble" | "pareto";

export default function ChartsSection({ processedData, trendData }: ChartsSectionProps) {
  const { state } = useDashboard();
  const [activeTab, setActiveTab] = useState<ChartTab>("trend");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const chartData = processedData.byBusinessType;

  const handleExport = () => {
    setIsModalOpen(true);
  };
  
  const aiContent = generateAiAnalysisText(activeTab, state, processedData, trendData);

  const ChartWrapper = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI分析
            </Button>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
  );


  return (
    <>
    <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as ChartTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4">
            <TabsTrigger value="trend">趋势分析</TabsTrigger>
            <TabsTrigger value="donut">占比分析</TabsTrigger>
            <TabsTrigger value="ranking">业务分布</TabsTrigger>
            <TabsTrigger value="bubble">多维气泡</TabsTrigger>
            <TabsTrigger value="pareto">帕累托</TabsTrigger>
        </TabsList>
        <TabsContent value="trend">
            <ChartWrapper title="趋势分析" description="追踪单个核心指标在连续时间周期内的表现。">
                <TrendChart data={trendData} />
            </ChartWrapper>
        </TabsContent>
        <TabsContent value="donut">
            <ChartWrapper title="占比分析" description="内外双环结构，对比各项业务在两个指标构成上的差异。">
                <DonutChart data={chartData} />
            </ChartWrapper>
        </TabsContent>
         <TabsContent value="ranking">
            <ChartWrapper title="业务分布" description="通过可排序的水平条形图，对所有业务线按选定指标进行分布展示。">
                <RankingChart data={chartData} />
            </ChartWrapper>
        </TabsContent>
        <TabsContent value="bubble">
            <ChartWrapper title="多维气泡图" description="通过气泡的位置和大小，同时比较不同业务线的三个可定义指标。">
                <BubbleChart data={chartData} />
            </ChartWrapper>
        </TabsContent>
        <TabsContent value="pareto">
            <ChartWrapper title="帕累托分析 (80/20法则)" description="结合条形图与折线图，识别贡献最大的关键业务线。">
                <ParetoChart data={chartData} />
            </ChartWrapper>
        </TabsContent>
    </Tabs>
    <AiAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={aiContent}
    />
    </>
  )
}
