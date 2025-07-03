"use client";

import { useState } from 'react';
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
import { kpiDetails, type BusinessLineData, type KpiKey } from '@/lib/types';

interface DataTableProps {
  data: BusinessLineData[];
}

type SortConfig = {
  key: KpiKey | 'name';
  direction: 'ascending' | 'descending';
} | null;

const headers: { key: KpiKey | 'name'; label: string }[] = [
  { key: 'name', label: '业务线' },
  ...Object.entries(kpiDetails).map(([key, { name }]) => ({ key: key as KpiKey, label: name }))
];

export default function DataTable({ data }: DataTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'premiumIncome', direction: 'descending' });

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    const aValue = a[key as keyof BusinessLineData];
    const bValue = b[key as keyof BusinessLineData];

    if (aValue < bValue) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: KpiKey | 'name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: KpiKey | 'name') => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUp className="ml-2 h-4 w-4 text-accent" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-accent" />;
  }

  const formatCell = (item: BusinessLineData, key: KpiKey | 'name') => {
    if (key === 'name') return item.name;
    const value = item[key];
    const { unit } = kpiDetails[key as KpiKey];
    if (unit === '%') return `${value.toFixed(2)}%`;
    if (unit === '元') return `¥${value.toLocaleString()}`;
    return value.toLocaleString();
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">详细数据表</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="mt-4 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header.key}>
                    <Button variant="ghost" onClick={() => requestSort(header.key)}>
                      {header.label}
                      {getSortIcon(header.key)}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id}>
                  {headers.map(header => (
                      <TableCell key={`${item.id}-${header.key}`}>
                          {formatCell(item, header.key)}
                      </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
