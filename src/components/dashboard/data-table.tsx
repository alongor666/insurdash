"use client";

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { KPIS, KPI_IDS } from '@/lib/kpi-config';
import type { DashboardData, KpiKey } from '@/lib/types';
import { getDynamicColorByVCR } from '@/lib/colors';
import { formatKpiValue } from '@/lib/data-utils';
import { ScrollArea } from '../ui/scroll-area';

interface DataTableProps {
  processedData: DashboardData;
}

const COLORED_KPIS: Set<KpiKey> = new Set([
  'variable_cost_ratio', 'marginal_contribution_ratio', 'loss_ratio', 'expense_ratio'
]);

type SortConfig = {
  key: KpiKey | 'business_type';
  direction: 'ascending' | 'descending';
};

export default function DataTable({ processedData }: DataTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'premium_written', direction: 'descending' });

  const sortedData = useMemo(() => {
    return [...processedData.byBusinessType].sort((a, b) => {
      const { key, direction } = sortConfig;
      
      const aValue = key === 'business_type' ? a.business_type : a.kpis[key];
      const bValue = key === 'business_type' ? b.business_type : b.kpis[key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [processedData.byBusinessType, sortConfig]);

  const requestSort = (key: KpiKey | 'business_type') => {
    setSortConfig(current => {
      if (current.key === key && current.direction === 'ascending') {
        return { key, direction: 'descending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const getSortIcon = (key: KpiKey | 'business_type') => {
    if (sortConfig.key !== key) {
        return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' 
        ? <ArrowUp className="h-4 w-4 text-accent" />
        : <ArrowDown className="h-4 w-4 text-accent" />;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4">
        <h3 className="text-lg font-semibold">详细数据表</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? "收起" : "展开"}
            <ChevronsUpDown className="h-4 w-4 ml-2" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ScrollArea className="w-full whitespace-nowrap">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                    <TableHead className="sticky left-0 bg-card z-20 min-w-[150px]">
                        <Button variant="ghost" onClick={() => requestSort('business_type')}>
                            业务类型 {getSortIcon('business_type')}
                        </Button>
                    </TableHead>
                    {KPI_IDS.map(kpiId => (
                    <TableHead key={kpiId} className="min-w-[150px]">
                        <Button variant="ghost" onClick={() => requestSort(kpiId)}>
                            {KPIS[kpiId].name} {getSortIcon(kpiId)}
                        </Button>
                    </TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedData.map((item) => (
                    <TableRow key={item.business_type}>
                        <TableCell className="sticky left-0 bg-card font-medium z-10">{item.business_type}</TableCell>
                        {KPI_IDS.map(kpiId => (
                            <TableCell 
                                key={kpiId} 
                                className="text-right"
                                style={{
                                    color: COLORED_KPIS.has(kpiId) ? getDynamicColorByVCR(item.kpis.variable_cost_ratio) : 'inherit'
                                }}
                            >
                                {formatKpiValue(item.kpis[kpiId], KPIS[kpiId].unit)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}
