export type BusinessLineData = {
  id: string;
  name: string;
  premiumIncome: number;
  payoutRate: number;
  comprehensiveCostRate: number;
  newPolicies: number;
  renewalRate: number;
  customerAcquisitionCost: number;
  averageClaimCost: number;
  claimFrequency: number;
};

export type PeriodData = {
  id: string;
  name: string;
  data: BusinessLineData[];
};

export type KpiKey = keyof Omit<BusinessLineData, 'id' | 'name'>;

export const kpiDetails: Record<KpiKey, { name: string; unit: '%' | '元' | '件' | '' }> = {
  premiumIncome: { name: '保费收入', unit: '元' },
  payoutRate: { name: '赔付率', unit: '%' },
  comprehensiveCostRate: { name: '综合成本率', unit: '%' },
  newPolicies: { name: '新保业务', unit: '件' },
  renewalRate: { name: '续保率', unit: '%' },
  customerAcquisitionCost: { name: '获客成本', unit: '元' },
  averageClaimCost: { name: '案均赔款', unit: '元' },
  claimFrequency: { name: '出险频率', unit: '%' },
};
