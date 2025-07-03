import { KPIS, KPI_IDS } from "./kpi-config";
import { getComparisonMetrics, formatKpiValue } from "./data";
import type { DashboardData, DashboardState } from "./types";

export function generateAiAnalysisText(
    chart: string,
    state: Omit<DashboardState, 'processedData' | 'trendData'>,
    processedData: DashboardData,
): string {

    const { currentPeriod, comparePeriod, analysisMode, selectedBusinessTypes, periods } = state;
    const currentPeriodLabel = periods.find(p => p.id === currentPeriod)?.name || currentPeriod;
    const comparePeriodLabel = periods.find(p => p.id === comparePeriod)?.name || comparePeriod;

    let kpiTable = `| 指标 | 当前周期 | 对比周期 | 变化 |\n`;
    kpiTable += `|:---|---:|---:|---:|\n`;
    for(const kpiId of KPI_IDS) {
        const kpi = KPIS[kpiId];
        const currentVal = processedData.summary.current.kpis[kpiId];
        const compareVal = processedData.summary.compare.kpis[kpiId];
        
        const { diff, percentageChange, isZero, isNew, unit } = getComparisonMetrics(kpiId, currentVal, compareVal);
        let changeText;
        if (isZero) {
            changeText = "无变化";
        } else if (isNew) {
            changeText = "新增";
        } else {
             if (unit === '%') {
                changeText = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} p.p. (${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`;
            } else {
                changeText = `${formatKpiValue(diff, unit)} (${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%)`;
            }
        }
        
        kpiTable += `| ${kpi.name} | ${formatKpiValue(currentVal, kpi.unit)} | ${formatKpiValue(compareVal, kpi.unit)} | ${changeText.replace(/\s+/g, '')} |\n`;
    }

    let chartData = `| 业务线 | ${KPI_IDS.map(id => KPIS[id].name).join(' | ')} |\n`;
    chartData += `|:---|${KPI_IDS.map(() => '---:').join('')}|\n`;
    processedData.byBusinessType.forEach(line => {
        chartData += `| ${line.business_type} | ${KPI_IDS.map(id => formatKpiValue(line.kpis[id], KPIS[id].unit)).join(' | ')} |\n`;
    });


    return `
# 车险经营分析报告请求

## 1. 分析背景

请基于以下数据和背景，为我生成一份专业的车险经营分析报告。

- **当前周期**: ${currentPeriodLabel}
- **对比周期**: ${comparePeriodLabel}
- **分析模式**: ${analysisMode === 'ytd' ? '累计 (YTD)' : '当周 (PoP)'}
- **分析范围**: ${selectedBusinessTypes.length === state.businessTypes.length ? '全部业务' : selectedBusinessTypes.join(', ')}

## 2. 核心指标看板 (KPIs)

这是当前筛选范围下的核心指标概览：

${kpiTable}

## 3. 当前图表详细数据

这是 "${chart}" 图表所使用的数据明细：

${chartData}

## 4. AI 分析指令

请你扮演一位专业的车险数据分析师，完成以下任务：

1.  **总体表现摘要**: 总结当前周期的整体经营状况，指出最显著的亮点和潜在风险点。
2.  **深入分析**: 结合核心指标和图表数据，对关键指标的变化进行深入解读。例如，如果“边际贡献率”下降，请分析是“满期赔付率”上升了，还是“费用率”上升了？并结合“保费”和“赔款”的变化趋势进行解释。
3.  **业务线表现评估**: 识别出表现最好和最差的几个业务线。对于表现差的业务线，请从多个维度（如赔付率、费用率、出险率）诊断可能的原因。
4.  **提出建议**: 基于以上分析，提出3-5条具体的、可操作的业务改进建议。

请确保你的分析报告结构清晰、逻辑严谨、语言专业。
`;
}
