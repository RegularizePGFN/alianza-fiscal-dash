import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, History, RefreshCcw, Search, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange as RDPRange } from 'react-day-picker';
import { Proposal } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import {
  deleteProposalById,
  useProposalsHistoryList,
  useProposalsHistorySummary,
  useSellersList,
} from '@/hooks/proposals/useProposalsHistory';
import HistoryKpis from '@/components/proposals/history/HistoryKpis';
import HistoryCharts from '@/components/proposals/history/HistoryCharts';
import HistoryTable from '@/components/proposals/history/HistoryTable';
import ProposalPreviewDialog from '@/components/proposals/history/ProposalPreviewDialog';
import { useToast } from '@/hooks/use-toast';

type Preset = 'today' | 'last7' | 'last30' | 'custom';

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

const HistoryTabContent: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [preset, setPreset] = useState<Preset>('last30');
  const [customRange, setCustomRange] = useState<RDPRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);
  const [seller, setSeller] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [preview, setPreview] = useState<Proposal | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [preset, customRange, seller, debouncedSearch, pageSize]);

  const { from, to, rangeLabel } = useMemo(() => {
    const today = new Date();
    if (preset === 'today') {
      return {
        from: startOfDay(today),
        to: endOfDayExclusive(today),
        rangeLabel: format(today, "dd 'de' MMM yyyy", { locale: ptBR }),
      };
    }
    if (preset === 'last7') {
      const start = startOfDay(subDays(today, 6));
      return {
        from: start,
        to: endOfDayExclusive(today),
        rangeLabel: `${format(start, 'dd/MM', { locale: ptBR })} – ${format(today, 'dd/MM/yyyy', { locale: ptBR })}`,
      };
    }
    if (preset === 'last30') {
      const start = startOfDay(subDays(today, 29));
      return {
        from: start,
        to: endOfDayExclusive(today),
        rangeLabel: `${format(start, 'dd/MM', { locale: ptBR })} – ${format(today, 'dd/MM/yyyy', { locale: ptBR })}`,
      };
    }
    const cFrom = customRange?.from ?? startOfDay(today);
    const cTo = customRange?.to ?? cFrom;
    return {
      from: startOfDay(cFrom),
      to: endOfDayExclusive(cTo),
      rangeLabel:
        format(cFrom, 'dd/MM/yyyy', { locale: ptBR }) === format(cTo, 'dd/MM/yyyy', { locale: ptBR })
          ? format(cFrom, 'dd/MM/yyyy', { locale: ptBR })
          : `${format(cFrom, 'dd/MM/yyyy', { locale: ptBR })} – ${format(cTo, 'dd/MM/yyyy', { locale: ptBR })}`,
    };
  }, [preset, customRange]);

  const effectiveSeller = isAdmin && seller !== 'all' ? seller : null;

  const summaryQ = useProposalsHistorySummary({
    from,
    to,
    sellerId: effectiveSeller,
  });
  const listQ = useProposalsHistoryList({
    from,
    to,
    sellerId: effectiveSeller,
    page,
    pageSize,
    search: debouncedSearch,
  });
  const sellersQ = useSellersList(isAdmin);

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['proposals-history-summary'] });
    qc.invalidateQueries({ queryKey: ['proposals-history-list'] });
  };

  const handleDelete = async (p: Proposal) => {
    if (!window.confirm(`Excluir a proposta de ${p.data.clientName}?`)) return;
    try {
      await deleteProposalById(p.id);
      toast({ title: 'Proposta excluída' });
      handleRefresh();
    } catch (e: any) {
      toast({
        title: 'Erro ao excluir',
        description: e?.message ?? 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const filtersActive = preset !== 'last30' || seller !== 'all' || !!debouncedSearch;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header + filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">Histórico de propostas</h2>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Visão completa da equipe' : 'Suas propostas geradas'} ·{' '}
              <Badge variant="secondary" className="text-[10px] align-middle ml-1">
                {rangeLabel}
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
            <SelectTrigger className="h-9 w-[170px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="last7">Últimos 7 dias</SelectItem>
              <SelectItem value="last30">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>

          {preset === 'custom' && (
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 justify-start text-xs gap-2',
                    !customRange?.from && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {customRange?.from
                    ? customRange.to && customRange.to.getTime() !== customRange.from.getTime()
                      ? `${format(customRange.from, 'dd/MM/yy', { locale: ptBR })} – ${format(customRange.to, 'dd/MM/yy', { locale: ptBR })}`
                      : format(customRange.from, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Escolher datas'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={(r) => {
                    setCustomRange(r);
                    if (r?.from && r?.to) setCalOpen(false);
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}

          {isAdmin && (
            <Select value={seller} onValueChange={setSeller}>
              <SelectTrigger className="h-9 w-[200px] text-xs">
                <SelectValue placeholder="Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {(sellersQ.data ?? []).map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={handleRefresh}
            disabled={summaryQ.isFetching || listQ.isFetching}
          >
            <RefreshCcw
              className={cn('h-3.5 w-3.5', (summaryQ.isFetching || listQ.isFetching) && 'animate-spin')}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <HistoryKpis kpis={summaryQ.data?.kpis} isLoading={summaryQ.isLoading} />

      {/* Charts */}
      <HistoryCharts
        from={from}
        to={to}
        daily={summaryQ.data?.daily ?? []}
        bySeller={summaryQ.data?.by_seller ?? []}
        showBySeller={isAdmin}
        isLoading={summaryQ.isLoading}
      />

      {/* Search + clear */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, CNPJ ou nº da dívida..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-xs"
          />
        </div>
        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-xs"
            onClick={() => {
              setPreset('last30');
              setSeller('all');
              setSearch('');
              setCustomRange(undefined);
            }}
          >
            <X className="h-3 w-3" /> Limpar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <HistoryTable
        proposals={listQ.data?.items ?? []}
        total={listQ.data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={listQ.isLoading}
        showSeller={isAdmin}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpen={setPreview}
        onDelete={handleDelete}
      />

      <ProposalPreviewDialog
        proposal={preview}
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </div>
  );
};

export default HistoryTabContent;
