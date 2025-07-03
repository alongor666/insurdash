import { supabase } from './supabase/client';
import type { BusinessLineData, Period, BusinessLine } from './types';

export async function getPeriods(): Promise<Period[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('business_data')
        .select('period_id, period_name')
        .order('period_id', { ascending: false });

    if (error) {
        console.error('Error fetching periods:', error);
        throw error;
    }

    const uniquePeriods = Array.from(new Map(data.map(item => [item.period_id, {id: item.period_id, name: item.period_name}])).values());
    
    return uniquePeriods;
}

export async function getBusinessLines(): Promise<BusinessLine[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('business_data')
        .select('business_line_id, business_line_name');
    
    if (error) {
        console.error('Error fetching business lines:', error);
        throw error;
    }
    
    const uniqueBusinessLines = Array.from(new Map(data.map(item => [item.business_line_id, {id: item.business_line_id, name: item.business_line_name}])).values());

    return uniqueBusinessLines;
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
