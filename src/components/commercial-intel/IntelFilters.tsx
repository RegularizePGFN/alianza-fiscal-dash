import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export interface IntelFilterState {
  start: Date;
  end: Date;
  userId: string | null;
}

interface SalespersonOption {
  id: string;
  name: string;
}

interface Props {
  value: IntelFilterState;
  onChange: (v: IntelFilterState) => void;
}

export function IntelFilters({ value, onChange }: Props) {
  const [salespeople, setSalespeople] = useState<SalespersonOption[]>([]);
  const [monthDate, setMonthDate] = useState<Date>(value.start);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const [usingCustom, setUsingCustom] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "vendedor")
        .order("name");
      setSalespeople((data as any[]) || []);
    })();
  }, []);

  const applyMonth = (d: Date) => {
    setUsingCustom(false);
    setMonthDate(d);
    onChange({ start: startOfMonth(d), end: endOfMonth(d), userId: value.userId });
  };

  const applyCustom = () => {
    if (customRange.from && customRange.to) {
      setUsingCustom(true);
      onChange({ start: customRange.from, end: customRange.to, userId: value.userId });
    }
  };

  return (
    <Card className="p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => applyMonth(subMonths(monthDate, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-3 text-sm font-medium min-w-[140px] text-center capitalize">
          {usingCustom
            ? `${format(value.start, "dd/MM/yy")} → ${format(value.end, "dd/MM/yy")}`
            : format(monthDate, "MMMM yyyy", { locale: ptBR })}
        </div>
        <Button variant="outline" size="icon" onClick={() => applyMonth(addMonths(monthDate, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", usingCustom && "border-primary")}>
            <CalendarIcon className="h-4 w-4" />
            Período personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={customRange as any}
            onSelect={(r: any) => setCustomRange(r || {})}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="flex justify-end gap-2 p-2 border-t">
            <Button size="sm" variant="ghost" onClick={() => { setCustomRange({}); setUsingCustom(false); applyMonth(monthDate); }}>
              Limpar
            </Button>
            <Button size="sm" onClick={applyCustom} disabled={!customRange.from || !customRange.to}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vendedor</span>
        <Select
          value={value.userId ?? "all"}
          onValueChange={(v) => onChange({ ...value, userId: v === "all" ? null : v })}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {salespeople.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
