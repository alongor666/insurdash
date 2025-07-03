// This file is the single source of truth for shared data structure types.

export type KpiKey =
  | 'premium_written'
  | 'premium_earned'
  | 'total_loss_amount'
  | 'claim_count'
  | 'expense_amount'
  | 'policy_count'
  | 'avg_premium_per_policy'
  | 'avg_loss_per_case'
  | 'premium_earned_ratio'
  | 'expense_ratio'
  | 'loss_ratio'
  | 'claim_frequency'
  | 'variable_cost_ratio'
  | 'marginal_contribution_ratio'
  | 'marginal_contribution_amount'
  | 'premium_share'
  | 'avg_commercial_index';

export type RawBusinessData = {
    period_id: string;
    period_label: string;
    business_type: string;
    premium_written: number;
    premium_earned: number;
    total_loss_amount: number;
    expense_amount_raw: number;
    claim_count: number;
    avg_premium_per_policy: number;
    avg_commercial_index: number;
    comparison_period_id_mom: string;
    totals_for_period: {
        total_premium_written_overall: number;
    };
};

export type KpiSet = Record<KpiKey, number>;

export interface ProcessedBusinessData extends RawBusinessData {
    kpis: KpiSet;
}

export interface DashboardData {
    byBusinessType: ProcessedBusinessData[];
    summary: {
        current: ProcessedBusinessData;
        compare: ProcessedBusinessData;
    };
}

export interface TrendData {
    period_id: string;
    period_label: string;
    kpis: KpiSet;
}

export type AnalysisMode = 'ytd' | 'pop';

export interface DashboardState {
  periods: { id: string; name: string }[];
  businessTypes: string[];
  currentPeriod: string;
  comparePeriod: string;
  analysisMode: AnalysisMode;
  selectedBusinessTypes: string[];
  processedData: DashboardData | null;
  trendData: TrendData[];
}
