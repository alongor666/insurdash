
import type { KpiKey } from './types';

export const KPI_IDS = [
    'premium_written', 'premium_earned', 'total_loss_amount', 'claim_count',
    'expense_amount', 'policy_count', 'avg_premium_per_policy', 'avg_loss_per_case',
    'premium_earned_ratio', 'expense_ratio', 'loss_ratio', 'claim_frequency',
    'variable_cost_ratio', 'marginal_contribution_ratio', 'marginal_contribution_amount', 'premium_share',
    'avg_commercial_index'
] as const;

export type KpiConfig = {
    id: KpiKey;
    name: string;
    unit: '万元' | '%' | '件' | '' | '元';
    type: 'amount' | 'ratio' | 'count' | 'average';
    positiveChangeIs: 'up' | 'down';
};

export const KPIS: Record<KpiKey, KpiConfig> = {
    premium_written: { id: 'premium_written', name: '跟单保费', unit: '万元', type: 'amount', positiveChangeIs: 'up' },
    premium_earned: { id: 'premium_earned', name: '满期保费', unit: '万元', type: 'amount', positiveChangeIs: 'up' },
    total_loss_amount: { id: 'total_loss_amount', name: '总赔款', unit: '万元', type: 'amount', positiveChangeIs: 'down' },
    claim_count: { id: 'claim_count', name: '已报件数', unit: '件', type: 'count', positiveChangeIs: 'down' },
    expense_amount: { id: 'expense_amount', name: '费用额', unit: '万元', type: 'amount', positiveChangeIs: 'down' },
    policy_count: { id: 'policy_count', name: '保单件数', unit: '件', type: 'count', positiveChangeIs: 'up' },
    avg_premium_per_policy: { id: 'avg_premium_per_policy', name: '单均保费', unit: '元', type: 'average', positiveChangeIs: 'up' },
    avg_loss_per_case: { id: 'avg_loss_per_case', name: '案均赔款', unit: '元', type: 'average', positiveChangeIs: 'down' },
    premium_earned_ratio: { id: 'premium_earned_ratio', name: '保费满期率', unit: '%', type: 'ratio', positiveChangeIs: 'up' },
    expense_ratio: { id: 'expense_ratio', name: '费用率', unit: '%', type: 'ratio', positiveChangeIs: 'down' },
    loss_ratio: { id: 'loss_ratio', name: '满期赔付率', unit: '%', type: 'ratio', positiveChangeIs: 'down' },
    claim_frequency: { id: 'claim_frequency', name: '满期出险率', unit: '%', type: 'ratio', positiveChangeIs: 'down' },
    variable_cost_ratio: { id: 'variable_cost_ratio', name: '变动成本率', unit: '%', type: 'ratio', positiveChangeIs: 'down' },
    marginal_contribution_ratio: { id: 'marginal_contribution_ratio', name: '边际贡献率', unit: '%', type: 'ratio', positiveChangeIs: 'up' },
    marginal_contribution_amount: { id: 'marginal_contribution_amount', name: '边贡额', unit: '万元', type: 'amount', positiveChangeIs: 'up' },
    premium_share: { id: 'premium_share', name: '保费占比', unit: '%', type: 'ratio', positiveChangeIs: 'up' },
    avg_commercial_index: { id: 'avg_commercial_index', name: '商业险平均自主系数', unit: '', type: 'average', positiveChangeIs: 'down' },
};

export const KPI_GRID_LAYOUT: (KpiKey | null)[] = [
    'premium_written', 'premium_earned', 'total_loss_amount', 'expense_amount',
    'policy_count', 'claim_count', 'avg_premium_per_policy', 'avg_loss_per_case',
    'premium_earned_ratio', 'expense_ratio', 'loss_ratio', 'claim_frequency',
    'variable_cost_ratio', 'marginal_contribution_ratio', 'marginal_contribution_amount', 'premium_share'
];

export const DONUT_PARETO_KPI_IDS: KpiKey[] = [
    'premium_written', 'premium_earned', 'total_loss_amount', 'expense_amount', 'policy_count', 'claim_count', 'marginal_contribution_amount'
];
