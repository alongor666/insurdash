
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboard } from '@/hooks/use-dashboard';
import { ChevronsUpDown } from 'lucide-react';
import type { AnalysisMode } from '@/lib/types';

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
  
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>(selectedBusinessTypes);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTempSelection(selectedBusinessTypes);
      setSearchQuery("");
    }
  }, [isOpen, selectedBusinessTypes]);

  const filteredBusinessTypes = useMemo(() => 
    businessTypes.filter(bt => bt.toLowerCase().includes(searchQuery.toLowerCase())),
    [businessTypes, searchQuery]
  );

  const handleSelectAll = () => setTempSelection(businessTypes);
  const handleDeselectAll = () => setTempSelection([]);
  const handleInvertSelection = () => {
    const currentSelectionInFiltered = new Set(tempSelection.filter(t => filteredBusinessTypes.includes(t)));
    const newSelection = [
        // Keep selections that were not part of the filtered list
        ...tempSelection.filter(t => !filteredBusinessTypes.includes(t)),
        // Invert selection for the currently visible items
        ...filteredBusinessTypes.filter(bt => !currentSelectionInFiltered.has(bt))
    ];
    setTempSelection(newSelection);
  };
  
  const handleConfirm = () => {
    setSelectedBusinessTypes(tempSelection);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="sticky top-[65px] z-30 bg-background/95 backdrop-blur-sm p-4 -mx-4 -mt-4 mb-4 border-b">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
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
          <Select value={comparePeriod} onValueChange={setComparePeriod} disabled={analysisMode !== 'comparison'}>
            <SelectTrigger><SelectValue placeholder="选择周期" /></SelectTrigger>
            <SelectContent>
              {periods.map(period => (
                <SelectItem key={period.id} value={period.id} disabled={period.id === currentPeriod}>{period.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
            <Label>业务类型</Label>
             <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="p-2 border-b">
                  <Input 
                    placeholder="搜索业务线..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="p-2 border-b flex justify-between">
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAll}>全选</Button>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleInvertSelection}>反选</Button>
                    <Button variant="link" size="sm" className="h-auto p-0" onClick={handleDeselectAll}>清空</Button>
                </div>
                <ScrollArea className="h-64">
                    <div className="p-2 space-y-1">
                    {filteredBusinessTypes.length > 0 ? filteredBusinessTypes.map((line) => (
                        <div key={line} className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted">
                        <Checkbox
                            id={`temp-${line}`}
                            checked={tempSelection.includes(line)}
                            onCheckedChange={(checked) => {
                            setTempSelection(current => 
                                checked
                                ? [...current, line]
                                : current.filter(id => id !== line)
                            );
                            }}
                        />
                        <Label htmlFor={`temp-${line}`} className="text-sm font-normal flex-1 cursor-pointer">
                            {line}
                        </Label>
                        </div>
                    )) : <p className="text-sm text-center text-muted-foreground p-4">无匹配结果</p>}
                    </div>
                </ScrollArea>
                 <div className="p-2 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>取消</Button>
                    <Button size="sm" onClick={handleConfirm}>确认</Button>
                </div>
              </PopoverContent>
            </Popover>
        </div>
        <div className="space-y-1">
            <Label>分析模式</Label>
            <RadioGroup
              value={analysisMode}
              onValueChange={(v) => setAnalysisMode(v as AnalysisMode)}
              className="flex items-center space-x-4 h-10"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="ytd" id="ytd" />
                <Label htmlFor="ytd" className="font-normal text-sm">年累计</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="pop" id="pop" />
                <Label htmlFor="pop" className="font-normal text-sm">当周</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="comparison" id="comparison" />
                <Label htmlFor="comparison" className="font-normal text-sm">对比</Label>
              </div>
            </RadioGroup>
        </div>
      </div>
    </div>
  );
}
