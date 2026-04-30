import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Download, FileText, X, CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTodayProposals } from "./useTodayProposals";
import { TodayProposalsTable } from "./TodayProposalsTable";
import { TodayProposalsCharts } from "./TodayProposalsCharts";
import { exportTodayProposalsToExcel } from "./exportTodayProposals";
import type { DateRange as RDPRange } from "react-day-picker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DiscountFilter = "all" | "with" | "without";
type DatePreset = "today" | "last7" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDayExclusive(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + 1);
  return x;
}

export function TodayProposalsDialog({ open, onOpenChange }: Props) {
  const [preset, setPreset] = useState<DatePreset>("today");
  const [customRange, setCustomRange] = useState<RDPRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const { from, to, rangeLabel } = useMemo(() => {
    const today = new Date();
    if (preset === "today") {
      return {
        from: startOfDay(today),
        to: endOfDayExclusive(today),
        rangeLabel: format(today, "dd/MM/yyyy", { locale: ptBR }),
      };
    }
    if (preset === "last7") {
      const start = startOfDay(subDays(today, 6));
      const end = endOfDayExclusive(today);
      return {
        from: start,
        to: end,
        rangeLabel: `${format(start, "dd/MM", { locale: ptBR })} – ${format(today, "dd/MM/yyyy", { locale: ptBR })}`,
      };
    }
    // custom
    const cFrom = customRange?.from ?? startOfDay(today);
    const cTo = customRange?.to ?? cFrom;
    return {
      from: startOfDay(cFrom),
      to: endOfDayExclusive(cTo),
      rangeLabel:
        format(cFrom, "dd/MM/yyyy", { locale: ptBR }) === format(cTo, "dd/MM/yyyy", { locale: ptBR })
          ? format(cFrom, "dd/MM/yyyy", { locale: ptBR })
          : `${format(cFrom, "dd/MM/yyyy", { locale: ptBR })} – ${format(cTo, "dd/MM/yyyy", { locale: ptBR })}`,
    };
  }, [preset, customRange]);

  const { data, isLoading } = useTodayProposals({ enabled: open, from, to });
  const all = data ?? [];

  const [seller, setSeller] = useState<string>("all");
  const [discount, setDiscount] = useState<DiscountFilter>("all");

  const sellers = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach((p) => {
      if (p.userId && !map.has(p.userId)) map.set(p.userId, p.userName);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [all]);

  const proposals = useMemo(() => {
    return all.filter((p) => {
      if (seller !== "all" && p.userId !== seller) return false;
      const hasDiscount = (p.discountPercentage ?? 0) > 0 || p.discountedValue < p.totalDebt;
      if (discount === "with" && !hasDiscount) return false;
      if (discount === "without" && hasDiscount) return false;
      return true;
    });
  }, [all, seller, discount]);

  const selectedSellerName =
    seller === "all" ? null : sellers.find((s) => s.id === seller)?.name ?? null;

  const filtersActive = seller !== "all" || discount !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1400px] max-h-[92vh] overflow-hidden p-4 sm:p-6 flex flex-col">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="flex items-start gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Propostas Geradas
                  {selectedSellerName && (
                    <span className="text-primary"> — {selectedSellerName}</span>
                  )}
                </DialogTitle>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {rangeLabel}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {proposals.length} {proposals.length === 1 ? "proposta" : "propostas"}
                    {filtersActive && all.length !== proposals.length && (
                      <span className="ml-1 text-muted-foreground">de {all.length}</span>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportTodayProposalsToExcel(proposals, { from, to })}
              disabled={isLoading || proposals.length === 0}
              className="gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar Excel
            </Button>
          </div>

          {/* Date picker + Filtros */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Período:
            </span>
            <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="last7">Últimos 7 dias</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>
            {preset === "custom" && (
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 justify-start text-left text-xs font-normal gap-2",
                      !customRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {customRange?.from
                      ? customRange.to && customRange.to.getTime() !== customRange.from.getTime()
                        ? `${format(customRange.from, "dd/MM/yyyy", { locale: ptBR })} – ${format(customRange.to, "dd/MM/yyyy", { locale: ptBR })}`
                        : format(customRange.from, "dd/MM/yyyy", { locale: ptBR })
                      : "Escolher datas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={(r) => {
                      setCustomRange(r);
                      if (r?.from && r?.to) setCalOpen(false);
                    }}
                    numberOfMonths={2}
                    locale={ptBR}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground ml-2">
              Filtros:
            </span>
            <Select value={seller} onValueChange={setSeller}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {sellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={discount} onValueChange={(v) => setDiscount(v as DiscountFilter)}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue placeholder="Desconto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas (com e sem desconto)</SelectItem>
                <SelectItem value="with">Somente com desconto</SelectItem>
                <SelectItem value="without">Somente sem desconto</SelectItem>
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-xs"
                onClick={() => {
                  setSeller("all");
                  setDiscount("all");
                }}
              >
                <X className="h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-5 flex-1 min-h-0">
            <div className="lg:col-span-3 space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : (
          <div className="min-h-0 overflow-y-auto mt-2">
            <div className="grid gap-4 lg:grid-cols-5 items-stretch">
              <div className="lg:col-span-3 flex flex-col min-h-0">
                <TodayProposalsTable data={proposals} />
              </div>
              <div className="lg:col-span-2">
                <TodayProposalsCharts data={proposals} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
