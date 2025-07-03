
import { supabase } from './supabase/client';
import type { RawBusinessData } from './types';

export async function getFilterOptions(): Promise<{ periods: { id: string, name: string }[], businessTypes: string[] }> {
    if (!supabase) return { periods: [], businessTypes: [] };
    
    const { data, error } = await supabase
        .from('business_data')
        .select('period_id, period_label, business_type');

    if (error) {
        console.error('Error fetching filter options:', error);
        throw error;
    }

    if (!data) {
        return { periods: [], businessTypes: [] };
    }

    const periodMap = new Map<string, string>();
    const businessTypeSet = new Set<string>();

    data.forEach(item => {
        if (item.period_id && item.period_label) {
            periodMap.set(item.period_id, item.period_label);
        }
        if (item.business_type) {
            businessTypeSet.add(item.business_type);
        }
    });

    const periods = Array.from(periodMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => b.id.localeCompare(a.id)); // Sort by ID desc (e.g., 2025-W26 before 2025-W25)
    
    const businessTypes = Array.from(businessTypeSet).sort();
    
    return { periods, businessTypes };
}

export async function getRawDataForPeriod(periodId: string): Promise<RawBusinessData[]> {
    if (!supabase || !periodId) return [];
    
    const { data, error } = await supabase
        .from('business_data')
        .select('*')
        .eq('period_id', periodId);
        
    if (error) {
        console.error(`Error fetching data for period ${periodId}:`, error);
        throw error;
    }
    
    return data as RawBusinessData[];
}


export async function getRawDataForTrend(
    endPeriodId: string,
    count: number
): Promise<{ period_id: string, period_label: string, current: RawBusinessData[], previous: RawBusinessData[] }[]> {
    if (!supabase || !endPeriodId) return [];

    const { data: periodIdsData, error: idsError } = await supabase
        .from('business_data')
        .select('period_id, comparison_period_id_mom')
        .eq('period_id', endPeriodId)
        .limit(1);

    if (idsError || !periodIdsData || periodIdsData.length === 0) {
        console.error('Could not fetch start period for trend', idsError);
        return [];
    }

    let allPeriodIds = new Set<string>();
    let currentId = endPeriodId;
    
    // This is not efficient, but it's the only way with the current schema
    // A proper date or integer column for periods would be better.
    const { data: allPeriods, error: allPeriodsError } = await supabase
        .from('business_data')
        .select('period_id')
        .order('period_id', { ascending: false });

    if(allPeriodsError || !allPeriods) {
        return [];
    }
    const sortedPeriodIds = [...new Set(allPeriods.map(p => p.period_id))];
    const startIndex = sortedPeriodIds.indexOf(endPeriodId);
    if(startIndex === -1) return [];

    const trendPeriodIds = sortedPeriodIds.slice(startIndex, startIndex + count + 1);


    const { data: trendData, error: trendError } = await supabase
        .from('business_data')
        .select('*')
        .in('period_id', trendPeriodIds);

    if (trendError) {
        console.error('Error fetching trend data:', trendError);
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
