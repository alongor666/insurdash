import type { PeriodData } from './types';

export const MOCK_BUSINESS_LINES = [
    { id: 'bl_1', name: '交强险' },
    { id: 'bl_2', name: '车损险' },
    { id: 'bl_3', name: '三者险' },
    { id: 'bl_4', name: '座位险' },
    { id: 'bl_5', name: '盗抢险' },
    { id: 'bl_6', name: '新能源车险' },
    { id: 'bl_7', name: '摩托车险' }
];

const generateBusinessData = (periodMultiplier: number) => MOCK_BUSINESS_LINES.map((line, index) => {
    const base = (index + 1) * periodMultiplier;
    return {
        id: line.id,
        name: line.name,
        premiumIncome: 1000000 * base + Math.random() * 200000,
        payoutRate: 50 + (Math.random() - 0.5) * 10 * periodMultiplier,
        comprehensiveCostRate: 95 + (Math.random() - 0.5) * 5 * periodMultiplier,
        newPolicies: 500 * base + Math.random() * 100,
        renewalRate: 70 + (Math.random() - 0.5) * 15,
        customerAcquisitionCost: 300 * base * (1 / periodMultiplier) + Math.random() * 50,
        averageClaimCost: 5000 + (Math.random() - 0.5) * 1000,
        claimFrequency: 15 + (Math.random() - 0.5) * 5,
    }
})

export const MOCK_PERIODS: PeriodData[] = [
    { id: 'p_2024_w26', name: '2024年第26周', data: generateBusinessData(1.2) },
    { id: 'p_2024_w25', name: '2024年第25周', data: generateBusinessData(1.15) },
    { id: 'p_2024_w24', name: '2024年第24周', data: generateBusinessData(1.1) },
    { id: 'p_2023_w26', name: '2023年第26周', data: generateBusinessData(0.9) },
];
