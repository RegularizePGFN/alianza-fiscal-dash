
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type DateFilterType = 'last7days' | 'last30days' | 'custom';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface ProposalsDateFilterProps {
  filterType: DateFilterType;
  dateRange: DateRange;
  onFilterChange: (type: DateFilterType, range?: DateRange) => void;
}

export function ProposalsDateFilter({ filterType, dateRange, onFilterChange }: ProposalsDateFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    const type = value as DateFilterType;
    onFilterChange(type);
  };

  const handleCustomDateChange = (range: DateRange) => {
    onFilterChange('custom', range);
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'last7days':
        return 'Últimos 7 dias';
      case 'last30days':
        return 'Últimos 30 dias';
      case 'custom':
        if (dateRange.from && dateRange.to) {
          return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
        }
        return 'Período personalizado';
      default:
        return 'Selecionar período';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Período:</span>
        <Select value={filterType} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Últimos 7 dias</SelectItem>
            <SelectItem value="last30days">Últimos 30 dias</SelectItem>
            <SelectItem value="custom">Período personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filterType === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-60 justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getFilterLabel()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) {
                  handleCustomDateChange(range);
                  if (range.from && range.to) {
                    setIsCalendarOpen(false);
                  }
                }
              }}
              numberOfMonths={2}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
