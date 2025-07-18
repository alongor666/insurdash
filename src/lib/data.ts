
import { createClient } from './supabase/client';
import type { RawBusinessData, DashboardData, KpiKey, ProcessedBusinessData, TrendData, AnalysisMode } from './types';
import { KPIS } from "./kpi-config";

// #region Data Fetching

export async function getFilterOptions(): Promise<{ periods: { id: string, name: string }[], businessTypes: string[] }> {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('business_data')
        .select('period_id, period_label, business_type');

    if (error) {
        console.error('Error fetching filter options:', error);
        return { periods: [], businessTypes: [] };
    }

    if (!data || data.length === 0) {
        return { periods: [], businessTypes: [] };
    }

    const periodMap = new Map<string, string>();
    const businessTypeSet = new Set<string>();

    for (const item of data) {
        if (item.period_id && item.period_label) {
            periodMap.set(item.period_id, item.period_label);
        }
        if (item.business_type) {
            businessTypeSet.add(item.business_type);
        }
    }

    const periods = Array.from(periodMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => b.id.localeCompare(a.id)); 
    
    const businessTypes = Array.from(businessTypeSet).sort();
    
    return { periods, businessTypes };
}

export async function getRawDataForPeriod(periodId: string): Promise<RawBusinessData[]> {
    const supabase = createClient();
    if (!periodId) return [];
    
    const { data, error } = await supabase
        .from('business_data')
        .select('*')
        .eq('period_id', periodId);
        
    if (error) {
        console.error(`Error fetching data for period ${periodId}:`, error);
        return [];
    }
    
    return (data as RawBusinessData[]) || [];
}


export async function getRawDataForTrend(
    endPeriodId: string,
    count: number
): Promise<{ period_id: string, period_label: string, current: RawBusinessData[], previous: RawBusinessData[] }[]> {
    const supabase = createClient();
    if (!endPeriodId) return [];

    const { data: allPeriods, error: allPeriodsError } = await supabase
        .from('business_data')
        .select('period_id')
        .order('period_id', { ascending: false });

    if(allPeriodsError || !allPeriods || allPeriods.length === 0) {
        console.error("Error fetching all period IDs for trend.", allPeriodsError);
        return [];
    }
    const sortedPeriodIds = [...new Set(allPeriods.map(p => p.period_id))];
    const startIndex = sortedPeriodIds.indexOf(endPeriodId);
    if(startIndex === -1) return [];

    const trendPeriodIds = sortedPeriodIds.slice(startIndex, startIndex + count + 1);

    if (trendPeriodIds.length === 0) return [];

    const { data: trendData, error: trendError } = await supabase
        .from('business_data')
        .select('*')
        .in('period_id', trendPeriodIds);

    if (trendError || !trendData) {
        console.error('Error fetching trend data', trendError);
        return [];
    }
    
    const dataByPeriod = trendData.reduce((acc, row) => {
        if (!acc[row.period_id]) {
            acc[row.period_id] = [];
        }
        acc[row.period_id].push(row as RawBusinessData);
        return acc;
    }, {} as Record<string, RawBusinessData[]>);
    
    const result = [];
    for(let i = 0; i < count; i++) {
        const currentPeriodId = sortedPeriodIds[startIndex + i];
        const previousPeriodId = sortedPeriodIds[startIndex + i + 1];

        if(!currentPeriodId || !previousPeriodId) break;

        const current = dataByPeriod[currentPeriodId] || [];
        const previous = dataByPeriod[previousPeriodId] || [];
        
        if (current.length > 0) {
             result.push({
                period_id: currentPeriodId,
                period_label: current[0].period_label,
                current,
                previous
             })
        }
    }
    
    return result.reverse();
}
// #endregion

// #region Data Processing
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
    
    kpis.premium_share = 0; 
    
    kpis.avg_commercial_index = rawData.avg_commercial_index || 0;

    return kpis;
}


function aggregateRawData(data: RawBusinessData[]): RawBusinessData {
    if (data.length === 0) {
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

        totalPremiumForAvg += (item.avg_premium_per_policy || 0) * (item.premium_written || 0);
    }

    aggregated.avg_premium_per_policy = safeDivide(totalPremiumForAvg, aggregated.premium_written);
    
    return {
        ...aggregated,
        period_id: data[0]?.period_id || '',
        period_label: data[0]?.period_label || '',
        business_type: 'Aggregated',
        comparison_period_id_mom: data[0]?.comparison_period_id_mom || '',
        totals_for_period: data[0]?.totals_for_period || { total_premium_written_overall: 0 },
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
            avg_premium_per_policy: currentItem.avg_premium_per_policy,
            avg_commercial_index: currentItem.avg_commercial_index
        };
        return popData;
    });
}

interface ProcessDataParams {
    currentPeriodRawData: RawBusinessData[];
    comparePeriodRawData: RawBusinessData[];
    prevCurrentPeriodRawData: RawBusinessData[];
    prev2PeriodRawData: RawBusinessData[];
    selectedBusinessTypes: string[];
    analysisMode: AnalysisMode;
}

export function processDashboardData({
    currentPeriodRawData,
    comparePeriodRawData,
    prevCurrentPeriodRawData,
    prev2PeriodRawData,
    selectedBusinessTypes,
    analysisMode,
}: ProcessDataParams): DashboardData | null {

    const currentFiltered = currentPeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));
    const compareFiltered = comparePeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));
    const prevCurrentFiltered = prevCurrentPeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));
    const prev2Filtered = prev2PeriodRawData.filter(d => selectedBusinessTypes.includes(d.business_type));

    let mainData: RawBusinessData[];
    let compareDataForKpi: RawBusinessData[];

    if (analysisMode === 'pop') {
        mainData = calculatePeriodOverPeriod(currentFiltered, prevCurrentFiltered);
        compareDataForKpi = calculatePeriodOverPeriod(prevCurrentFiltered, prev2Filtered);
    } else if (analysisMode === 'ytd') {
        mainData = currentFiltered;
        compareDataForKpi = prevCurrentFiltered;
    } else { // 'comparison'
        mainData = currentFiltered;
        compareDataForKpi = compareFiltered;
    }
    
    const totalPremiumOverallCurrent = currentPeriodRawData.reduce((sum, item) => sum + (item.premium_written || 0), 0);

    const byBusinessType = mainData.map(businessLineData => {
        const kpis = calculateKpis(businessLineData);
        const totalPremiumForShare = analysisMode === 'ytd' || analysisMode === 'comparison'
            ? totalPremiumOverallCurrent
            : currentFiltered.reduce((sum, item) => sum + (item.premium_written || 0), 0);
            
        kpis.premium_share = safeDivide(businessLineData.premium_written, totalPremiumForShare) * 100;
        
        if (selectedBusinessTypes.length !== 1 || analysisMode === 'pop') {
            kpis.avg_commercial_index = 0;
        }
        return { ...businessLineData, kpis };
    });
    
    const aggregateCurrent = aggregateRawData(mainData);
    const aggregateCompare = aggregateRawData(compareDataForKpi);

    const summaryCurrentKpis = calculateKpis(aggregateCurrent);
    const summaryCompareKpis = calculateKpis(aggregateCompare);

    if (selectedBusinessTypes.length !== 1 || analysisMode === 'pop') {
        summaryCurrentKpis.avg_commercial_index = 0;
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


export function processTrendData(
    trendRaw: { period_id: string, period_label: string, current: RawBusinessData[], previous: RawBusinessData[] }[],
    selectedBusinessTypes: string[]
): TrendData[] {
    if (!trendRaw || trendRaw.length === 0) return [];
    
    return trendRaw.map(periodData => {
        const ytdData = periodData.current.filter(d => selectedBusinessTypes.includes(d.business_type));
        const ytdAgg = aggregateRawData(ytdData);
        const ytdKpis = calculateKpis(ytdAgg);

        const popData = calculatePeriodOverPeriod(
            periodData.current.filter(d => selectedBusinessTypes.includes(d.business_type)),
            periodData.previous.filter(d => selectedBusinessTypes.includes(d.business_type))
        );
        const popAgg = aggregateRawData(popData);
        const popKpis = calculateKpis(popAgg);
        
        return {
            period_id: periodData.period_id,
            period_label: periodData.period_label,
            ytd_kpis: ytdKpis,
            pop_kpis: popKpis,
        };
    }).filter(p => p.ytd_kpis.policy_count > 0 || p.pop_kpis.policy_count !== 0);
}
// #endregion

// #region Formatting and Metrics
export function formatKpiValue(value: number, unit: '万元' | '%' | '件' | '' | '元' | 'p.p.', short = false): string {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }

    switch(unit) {
        case '万元':
        case '元':
        case '件': {
            const roundedValue = Math.round(value);
            if (short) {
                if (unit === '元' && Math.abs(roundedValue) >= 10000) {
                    return `${(roundedValue / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})}万`;
                }
                if (unit === '万元' && Math.abs(roundedValue) >= 10000) {
                    return `${(roundedValue / 10000).toLocaleString(undefined, {maximumFractionDigits: 1})}亿`;
                }
            }
            return roundedValue.toLocaleString();
        }

        case '%':
        case 'p.p.':
            return `${value.toFixed(1)}${unit}`;

        case '': // For avg_commercial_index, which is a coefficient
            return value.toFixed(4);

        default:
            return value.toLocaleString();
    }
}


export function getComparisonMetrics(kpiId: KpiKey, currentValue: number, previousValue: number) {
    const { positiveChangeIs, unit } = KPIS[kpiId];
    
    const isNew = (previousValue === 0 || previousValue === null || previousValue === undefined) && (currentValue !== 0 && currentValue !== null && currentValue !== undefined) && previousValue !== currentValue;

    if (previousValue === null || previousValue === undefined || !isFinite(previousValue) || previousValue === 0) {
        return { diff: currentValue, percentageChange: Infinity, isBetter: positiveChangeIs === 'up', isZero: currentValue === 0, isNew, unit };
    }

    const diff = currentValue - previousValue;
    const percentageChange = safeDivide(diff, Math.abs(previousValue)) * 100;

    const isPositive = diff > 0;
    const isBetter = (isPositive && positiveChangeIs === 'up') || (!isPositive && positiveChangeIs === 'down');
    
    return { diff, percentageChange, isBetter, isZero: Math.abs(diff) < 1e-6, isNew: false, unit };
}
// #endregion
