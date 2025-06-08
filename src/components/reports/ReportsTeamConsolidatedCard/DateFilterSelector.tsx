import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LocalDateFilter } from "./types";

interface DateFilterSelectorProps {
  localDateFilter: LocalDateFilter | null;
  onApplyDateFilter: (filter: LocalDateFilter | null) => void;
}

export function DateFilterSelector({ localDateFilter, onApplyDateFilter }: DateFilterSelectorProps) {
  const [dateFilterType, setDateFilterType] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const getDateFilterFromSelection = (): LocalDateFilter | null => {
    if (dateFilterType === 'month') {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (selectedMonth) {
        case 'current':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'previous':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        default:
          return null;
      }

      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    } else if (dateFilterType === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0]
      };
    }

    return null;
  };

  const applyDateFilter = () => {
    const filter = getDateFilterFromSelection();
    onApplyDateFilter(filter);
    setIsDatePopoverOpen(false);
  };

  const clearDateFilter = () => {
    onApplyDateFilter(null);
    setDateFilterType('month');
    setSelectedMonth('current');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setIsDatePopoverOpen(false);
  };

  const getDateFilterLabel = () => {
    if (!localDateFilter) return "Selecionar período";
    
    // Se temos um filtro de data aplicado, mostramos as datas formatadas
    const startDate = new Date(localDateFilter.startDate);
    const endDate = new Date(localDateFilter.endDate);
    
    // Verificar se é o mês atual (do primeiro dia até hoje)
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (localDateFilter.startDate === startOfMonth.toISOString().split('T')[0] && 
        localDateFilter.endDate === today.toISOString().split('T')[0]) {
      return "Mês atual";
    }
    
    return `${format(startDate, "dd/MM/yy")} - ${format(endDate, "dd/MM/yy")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4" />
      <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48">
            {getDateFilterLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Selecionar período</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Tipo de filtro</label>
                <Select value={dateFilterType} onValueChange={(value: 'month' | 'custom') => setDateFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Por mês</SelectItem>
                    <SelectItem value="custom">Data personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilterType === 'month' && (
                <div>
                  <label className="text-sm font-medium">Mês</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Mês atual</SelectItem>
                      <SelectItem value="previous">Mês passado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dateFilterType === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Data inicial</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Data final</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            <Separator />
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={clearDateFilter}>
                Limpar
              </Button>
              <Button size="sm" onClick={applyDateFilter}>
                <Check className="h-4 w-4 mr-1" />
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
