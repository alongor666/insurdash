"use client";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDashboard } from '@/hooks/use-dashboard';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalFiltersProps {
  periods: { id: string, name: string }[];
  businessTypes: string[];
}

export default function GlobalFilters({ periods, businessTypes }: GlobalFiltersProps) {
  const { state, actions } = useDashboard();
  const {
    currentPeriod,
    comparePeriod,
    analysisMode,
    selectedBusinessTypes,
  } = state;

  const { setPeriod, setComparePeriod, setAnalysisMode, setSelectedBusinessTypes } = actions;

  const handleSelectAll = () => setSelectedBusinessTypes(businessTypes);
  const handleDeselectAll = () => setSelectedBusinessTypes([]);
  const handleInvertSelection = () => {
    const newSelection = businessTypes.filter(bt => !selectedBusinessTypes.includes(bt));
    setSelectedBusinessTypes(newSelection);
  }

  return (
    <div className="sticky top-[65px] z-30 bg-background/95 backdrop-blur-sm p-4 -mx-4 -mt-4 mb-4 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div className="space-y-1">
          <Label>当前周期</Label>
          <Select value={currentPeriod} onValueChange={setPeriod} disabled={periods.length === 0}>
            <SelectTrigger><SelectValue placeholder="选择周期" /></SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>对比周期</Label>
          <Select value={comparePeriod} onValueChange={setComparePeriod} disabled={periods.length === 0}>
            <SelectTrigger><SelectValue placeholder="选择周期" /></SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
            <Label>业务类型</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between" disabled={businessTypes.length === 0}>
                  <span className="truncate">
                    {selectedBusinessTypes.length === 0 ? "选择业务线..." : 
                    selectedBusinessTypes.length === businessTypes.length ? "所有业务线" : 
                    `${selectedBusinessTypes.length} 个已选`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="搜索业务线..." />
                  <div className="p-2 border-b flex justify-between">
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAll}>全选</Button>
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={handleInvertSelection}>反选</Button>
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={handleDeselectAll}>清空</Button>
                  </div>
                  <CommandList>
                    <CommandEmpty>未找到业务线。</CommandEmpty>
                    <CommandGroup>
                      {businessTypes.map((line) => (
                        <CommandItem
                          key={line}
                          onSelect={() => {
                            setSelectedBusinessTypes(current => 
                              current.includes(line)
                                ? current.filter(id => id !== line)
                                : [...current, line]
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBusinessTypes.includes(line) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {line}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
        </div>
        <div className="flex items-center justify-center space-x-2 pt-6">
            <Label htmlFor="analysis-mode" className={cn(analysisMode !== 'pop' && "text-muted-foreground")}>当周(PoP)</Label>
            <Switch
                id="analysis-mode"
                checked={analysisMode === 'ytd'}
                onCheckedChange={(checked) => setAnalysisMode(checked ? 'ytd' : 'pop')}
            />
            <Label htmlFor="analysis-mode" className={cn(analysisMode !== 'ytd' && "text-muted-foreground")}>累计(YTD)</Label>
        </div>
      </div>
    </div>
  );
}
