import { supabase } from './supabase/client';
import type { BusinessLineData, Period, BusinessLine } from './types';

export async function getFilterOptions(): Promise<{ periods: Period[], businessLines: BusinessLine[] }> {
    if (!supabase) return { periods: [], businessLines: [] };
    
    // Removing .order() to prevent potential performance issues on large tables.
    // Sorting will be handled in the client-side code.
    const { data, error } = await supabase
        .from('business_data')
        .select('period_id, period_name, business_line_id, business_line_name');

    if (error) {
        console.error('Error fetching filter options:', error);
        throw error;
    }

    const periodMap = new Map<string, Period>();
    const businessLineMap = new Map<string, BusinessLine>();

    data.forEach(item => {
        if (item.period_id && item.period_name && !periodMap.has(item.period_id)) {
            periodMap.set(item.period_id, { id: item.period_id, name: item.period_name });
        }
        if (item.business_line_id && item.business_line_name && !businessLineMap.has(item.business_line_id)) {
            businessLineMap.set(item.business_line_id, { id: item.business_line_id, name: item.business_line_name });
        }
    });

    const uniquePeriods = Array.from(periodMap.values())
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort descending to get latest first
    
    const uniqueBusinessLines = Array.from(businessLineMap.values());
    
    return { periods: uniquePeriods, businessLines: uniqueBusinessLines };
}

export async function getDashboardData(periodId: string): Promise<BusinessLineData[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('business_data')
        .select('*')
        .eq('period_id', periodId);
        
    if (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
    
    return data.map(item => ({
        id: item.business_line_id,
        name: item.business_line_name,
        premiumIncome: item.premium_income,
        payoutRate: item.payout_rate,
        comprehensiveCostRate: item.comprehensive_cost_rate,
        newPolicies: item.new_policies,
        renewalRate: item.renewal_rate,
        customerAcquisitionCost: item.customer_acquisition_cost,
        averageClaimCost: item.average_claim_cost,
        claimFrequency: item.claim_frequency,
    }));
}
