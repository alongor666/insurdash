import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { KPIS } from "./kpi-config";
import type { DashboardData, KpiKey, ProcessedBusinessData, RawBusinessData } from "./types";

// Safely divide, returning 0 if denominator is 0
function safeDivide(numerator: number, denominator: number): number {
    if (denominator === 0 || !denominator) {
        return 0;
    }
    return numerator / denominator;
}

export function calculateKpis(rawData: RawBusinessData): ProcessedBusinessData['kpis'] {
    const kpis = {} as ProcessedBusinessData['kpis'];

    const premium_written = rawData.premium_written;
    const premium_earned = rawData.premium_earned;
    const total_loss_amount = rawData.total_loss_amount;
    const claim_count = rawData.claim_count;
    const avg_premium_per_policy = rawData.avg_premium_per_policy;

    kpis.premium_written = premium_written;
    kpis.premium_earned = premium_earned;
    kpis.total_loss_amount = total_loss_amount;
    kpis.claim_count = claim_count;
    
    // For aggregated data, this will be a weighted average. For single lines, it's from raw data.
    kpis.avg_premium_per_policy = avg_premium_per_policy;
    
    kpis.policy_count = safeDivide(premium_written * 10000, kpis.avg_premium_per_policy);

    kpis.expense_ratio = safeDivide(rawData.expense_amount_raw, premium_written) * 100;
    kpis.expense_amount = premium_written * (kpis.expense_ratio / 100);
    
    kpis.premium_earned_ratio = safeDivide(premium_earned, premium_written) * 100;
    
    kpis.loss_ratio = safeDivide(total_loss_amount, premium_earned) * 100;

    kpis.avg_loss_per_case = safeDivide(total_loss_amount * 10000, claim_count);

    const earned_policy_count = kpis.policy_count * (kpis.premium_earned_ratio / 100);
    kpis.claim_frequency = safeDivide(claim_count, earned_policy_count) * 100;
    
    kpis.variable_cost_ratio = kpis.loss_ratio + kpis.expense_ratio;
    
    kpis.marginal_contribution_ratio = 100 - kpis.variable_cost_ratio;
    
    kpis.marginal_contribution_amount = premium_earned * (kpis.marginal_contribution_ratio / 100);
    
    // These need total premium to be calculated, will be done in the processing step
    kpis.premium_share = 0; 
    
    // This is only available for single, non-aggregated business lines
    kpis.avg_commercial_index = rawData.avg_commercial_index || 0;

    return kpis;
}


function aggregateRawData(data: RawBusinessData[]): RawBusinessData {
    if (data.length === 0) {
        // Return a zeroed-out RawBusinessData object
        return {
            period_id: '',
            period_label: '',
            business_type: 'Aggregated',
            premium_written: 0,
            premium_earned: 0,
            total_loss_amount: 0,
            expense_amount_raw: 0,
            claim_count: 0,
            avg_premium_per_policy: 0,
            avg_commercial_index: 0,
            comparison_period_id_mom: '',
            totals_for_period: { total_premium_written_overall: 0 },
        };
    }
    const aggregated: Omit<RawBusinessData, 'business_type' | 'period_id' | 'period_label' | 'comparison_period_id_mom' | 'totals_for_period' | 'avg_commercial_index'> = {
        premium_written: 0,
        premium_earned: 0,
        total_loss_amount: 0,
        expense_amount_raw: 0,
        claim_count: 0,
        avg_premium_per_policy: 0,
    };

    let totalPremiumForAvg = 0;

    for (const item of data) {
        aggregated.premium_written += item.premium_written || 0;
        aggregated.premium_earned += item.premium_earned || 0;
        aggregated.total_loss_amount += item.total_loss_amount || 0;
        aggregated.expense_amount_raw += item.expense_amount_raw || 0;
        aggregated.claim_count += item.claim_count || 0;

        // For weighted average of avg_premium_per_policy
        totalPremiumForAvg += (item.avg_premium_per_policy || 0) * (item.premium_written || 0);
    }

    // Calculate weighted average for avg_premium_per_policy
    aggregated.avg_premium_per_policy = safeDivide(totalPremiumForAvg, aggregated.premium_written);
    
    return {
        ...aggregated,
        period_id: data[0].period_id,
        period_label: data[0].period_label,
        business_type: 'Aggregated',
        comparison_period_id_mom: data[0].comparison_period_id_mom,
        totals_for_period: data[0].totals_for_period,
        // avg_commercial_index is not meaningful when aggregated, except for single business type selection
        avg_commercial_index: data.length === 1 ? data[0].avg_commercial_index : 0,
    };
}


function calculatePeriodOverPeriod(current: RawBusinessData[], previous: RawBusinessData[]): RawBusinessData[] {
    const previousDataMap = new Map(previous.map(item => [item.business_type, item]));
    
    return current.map(currentItem => {
        const previousItem = previousDataMap.get(currentItem.business_type) || {
            premium_written: 0,
            premium_earned: 0,
            total_loss_amount: 0,
            expense_amount_raw: 0,
            claim_count: 0,
        };

        const popData: RawBusinessData = {
            ...currentItem,
            premium_written: (currentItem.premium_written || 0) - (previousItem.premium_written || 0),
            premium_earned: (currentItem.premium_earned || 0) - (previousItem.premium_earned || 0),
            total_loss_amount: (currentItem.total_loss_amount || 0) - (previousItem.total_loss_amount || 0),
            expense_amount_raw: (currentItem.expense_amount_raw || 0) - (previousItem.expense_amount_raw || 0),
            claim_count: (currentItem.claim_count || 0) - (previousItem.claim_count || 0),
            // For PoP, these are non-additive and should be taken from the current period directly
            avg_premium_per_policy: currentItem.avg_premium_per_policy,
            avg_commercial_index: currentItem.avg_commercial_index
        };
        return popData;
    });
}


export function processDashboardData(
    currentPeriodRawData: RawBusinessData[],
    comparePeriodRawData: RawBusinessData[],
    selectedBusinessTypes: string[],
    analysisMode: 'ytd' | 'pop'
): DashboardData {

    const currentFiltered = currentPeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));
    const compareFiltered = comparePeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));

    const currentDataForProcessing = analysisMode === 'ytd' 
        ? currentFiltered
        : calculatePeriodOverPeriod(currentFiltered, compareFiltered);

    const compareDataForProcessing = analysisMode === 'ytd' 
        ? compareFiltered
        : calculatePeriodOverPeriod(compareFiltered, []); // No previous for compare in PoP

    const totalPremiumCurrent = currentPeriodRawData.reduce((sum, item) => sum + (item.premium_written || 0), 0);
    const totalPremiumCompare = comparePeriodRawData.reduce((sum, item) => sum + (item.premium_written || 0), 0);

    const byBusinessType = currentDataForProcessing.map(businessLineData => {
        const kpis = calculateKpis(businessLineData);
        kpis.premium_share = safeDivide(kpis.premium_written, totalPremiumCurrent) * 100;
        // Only show avg_commercial_index for single business type selection in YTD mode
        if (selectedBusinessTypes.length !== 1 || analysisMode === 'pop') {
            kpis.avg_commercial_index = 0;
        }
        return { ...businessLineData, kpis };
    });

    const aggregateCurrent = aggregateRawData(currentDataForProcessing);
    const aggregateCompare = aggregateRawData(compareDataForProcessing);

    const summaryCurrentKpis = calculateKpis(aggregateCurrent);
    summaryCurrentKpis.premium_share = safeDivide(summaryCurrentKpis.premium_written, totalPremiumCurrent) * 100;
     if (selectedBusinessTypes.length !== 1 || analysisMode === 'pop') {
        summaryCurrentKpis.avg_commercial_index = 0;
    }
    
    const summaryCompareKpis = calculateKpis(aggregateCompare);
    summaryCompareKpis.premium_share = safeDivide(summaryCompareKpis.premium_written, totalPremiumCompare) * 100;
     if (selectedBusinessTypes.length !== 1 || analysisMode === 'pop') {
        summaryCompareKpis.avg_commercial_index = 0;
    }

    return {
        byBusinessType,
        summary: {
            current: { ...aggregateCurrent, kpis: summaryCurrentKpis },
            compare: { ...aggregateCompare, kpis: summaryCompareKpis },
        },
    };
}


export function formatKpiValue(value: number, unit: '万元' | '%' | '件' | '' | '元', short = false): string {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    switch(unit) {
        case '万元':
            if (short) {
                if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(0)}亿`;
                if (Math.abs(value) >= 1) return `${value.toFixed(0)}万`;
            }
            return value.toFixed(2);
        case '%':
            return `${value.toFixed(1)}%`;
        case '元':
             if (short) {
                if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}万`;
             }
            return value.toFixed(0);
        case '件':
            return value.toLocaleString();
        default:
            return value.toFixed(2);
    }
}


export function getComparisonText(kpiId: KpiKey, currentValue: number, previousValue: number) {
    const { positiveChangeIs, unit } = KPIS[kpiId];
    
    if (previousValue === 0 && currentValue === 0) {
        return { icon: Minus, text: "无变化", color: "hsl(var(--muted-foreground))" };
    }
    if (previousValue === 0) {
        return { icon: ArrowUp, text: "新增", color: "hsl(var(--accent))" };
    }

    const diff = currentValue - previousValue;
    const percentageChange = safeDivide(diff, Math.abs(previousValue)) * 100;

    let text;
    if (unit === '%') {
        text = `${diff.toFixed(1)} p.p. (${percentageChange.toFixed(1)}%)`;
    } else {
        text = `${formatKpiValue(diff, unit)} (${percentageChange.toFixed(1)}%)`;
    }
    
    const isPositive = diff > 0;
    let icon, color;

    if (Math.abs(diff) < 1e-6) {
        icon = Minus;
        color = 'hsl(var(--muted-foreground))';
    } else if ((isPositive && positiveChangeIs === 'up') || (!isPositive && positiveChangeIs === 'down')) {
        icon = ArrowUp;
        color = 'hsl(140, 80%, 40%)'; // Green
    } else {
        icon = ArrowDown;
        color = 'hsl(0, 80%, 50%)'; // Red
    }
    
    return { icon, text, color };
}
