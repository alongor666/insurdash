"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Period, BusinessLine } from '@/lib/types';

interface GlobalFiltersProps {
  periods: Period[];
  businessLines: BusinessLine[];
}

export default function GlobalFilters({ periods, businessLines }: GlobalFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPeriodId, setCurrentPeriodId] = useState(searchParams.get('cp') || '');
  const [comparePeriodId, setComparePeriodId] = useState(searchParams.get('pp') || '');
  const [analysisMode, setAnalysisMode] = useState(searchParams.get('mode') || 'ytd');
  const [selectedLines, setSelectedLines] = useState<string[]>(searchParams.get('bl')?.split(',') || []);

  useEffect(() => {
    setCurrentPeriodId(searchParams.get('cp') || '');
    setComparePeriodId(searchParams.get('pp') || '');
    setAnalysisMode(searchParams.get('mode') || 'ytd');
    setSelectedLines(searchParams.get('bl')?.split(',') || []);
  }, [searchParams]);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('cp', currentPeriodId);
    params.set('pp', comparePeriodId);
    params.set('mode', analysisMode);
    if (selectedLines.length > 0) {
      params.set('bl', selectedLines.join(','));
    } else {
      params.delete('bl');
    }
    
    if (params.toString() !== searchParams.toString()) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentPeriodId, comparePeriodId, analysisMode, selectedLines, router, searchParams]);

  useEffect(() => {
    const hasRequiredParams = currentPeriodId && comparePeriodId && selectedLines.length > 0;
    if(hasRequiredParams) {
        updateURL();
    }
  }, [currentPeriodId, comparePeriodId, selectedLines, updateURL]);

  const handleSelectAll = () => setSelectedLines(businessLines.map(l => l.id));
  const handleDeselectAll = () => setSelectedLines([]);

  return (
    <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-sm p-4 border-b">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>当前周期</Label>
          <Select value={currentPeriodId} onValueChange={setCurrentPeriodId} disabled={periods.length === 0}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择周期" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>对比周期</Label>
          <Select value={comparePeriodId} onValueChange={setComparePeriodId} disabled={periods.length === 0}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择周期" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>业务类型</Label>
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-[250px] justify-between" disabled={businessLines.length === 0}>
                <span className="truncate">
                  {selectedLines.length === 0 ? "选择业务线..." : 
                   selectedLines.length === businessLines.length ? "所有业务线" : 
                   `${selectedLines.length} 个已选`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="搜索业务线..." />
                <div className="p-2 border-b flex justify-between">
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAll}>全选</Button>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleDeselectAll}>全不选</Button>
                </div>
                <CommandList>
                  <CommandEmpty>未找到业务线。</CommandEmpty>
                  <CommandGroup>
                    {businessLines.map((line) => (
                      <CommandItem
                        key={line.id}
                        onSelect={() => {
                          setSelectedLines(current => 
                            current.includes(line.id)
                              ? current.filter(id => id !== line.id)
                              : [...current, line.id]
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLines.includes(line.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {line.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
         <div className="flex items-center space-x-2">
            <Label htmlFor="analysis-mode" className={cn(analysisMode !== 'pop' && "text-muted-foreground")}>当周(PoP)</Label>
            <Switch
                id="analysis-mode"
                checked={analysisMode === 'ytd'}
                onCheckedChange={(checked) => setAnalysisMode(checked ? 'ytd' : 'pop')}
            />
            <Label htmlFor="analysis-mode" className={cn(analysisMode !== 'ytd' && "text-muted-foreground")}>累计(YTD)</Label>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {businessLines.filter(l => selectedLines.includes(l.id)).map(line => (
            <Badge key={line.id} variant="secondary" className="pr-1">
                {line.name}
                <button 
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => setSelectedLines(current => current.filter(id => id !== line.id))}
                >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
            </Badge>
        ))}
      </div>
    </div>
  );
}
