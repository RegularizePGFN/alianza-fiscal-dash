import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SalesReportRow } from "./useSalesReport";

type SortKey = "userName" | "clientName" | "grossAmount" | "saleDate" | "paymentMethod";
type SortDir = "asc" | "desc";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatPhone = (phone: string | null) => {
  if (!phone) return "—";
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return phone;
};

const formatDate = (s: string) => {
  try {
    return format(parseISO(s), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return s;
  }
};

const defaultDirFor = (k: SortKey): SortDir =>
  k === "userName" || k === "clientName" || k === "paymentMethod" ? "asc" : "desc";

interface HeaderProps {
  label: string;
  k: SortKey;
  sorts: { key: SortKey; dir: SortDir }[];
  onSort: (k: SortKey, e: React.MouseEvent) => void;
  align?: "left" | "right";
}

function SortHeader({ label, k, sorts, onSort, align = "left" }: HeaderProps) {
  const idx = sorts.findIndex((s) => s.key === k);
  const active = idx !== -1;
  const dir = active ? sorts[idx].dir : "asc";
  const Icon = !active ? ArrowUpDown : dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={(e) => onSort(k, e)}
      title="Clique para ordenar. Shift+clique para adicionar como critério secundário."
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
        active ? "text-foreground" : "text-muted-foreground"
      } ${align === "right" ? "flex-row-reverse w-full justify-start" : ""}`}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" />
      {active && sorts.length > 1 && (
        <span className="text-[9px] font-bold text-primary">{idx + 1}</span>
      )}
    </button>
  );
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

interface Props {
  data: SalesReportRow[];
}

export function SalesReportTable({ data }: Props) {
  const [sorts, setSorts] = useState<{ key: SortKey; dir: SortDir }[]>([
    { key: "saleDate", dir: "desc" },
  ]);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const handleSort = (k: SortKey, e: React.MouseEvent) => {
    const additive = e.shiftKey;
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.key === k);
      if (additive) {
        if (idx === -1) return [...prev, { key: k, dir: defaultDirFor(k) }];
        const next = [...prev];
        next[idx] = { key: k, dir: next[idx].dir === "asc" ? "desc" : "asc" };
        return next;
      }
      if (idx === 0 && prev.length === 1) {
        return [{ key: k, dir: prev[0].dir === "asc" ? "desc" : "asc" }];
      }
      return [{ key: k, dir: idx !== -1 ? prev[idx].dir : defaultDirFor(k) }];
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    const digits = q.replace(/\D/g, "");
    return data.filter((r) => {
      if (
        r.userName?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.paymentMethod?.toLowerCase().includes(q)
      ) return true;
      if (digits.length > 0) {
        const docD = (r.clientDocument ?? "").replace(/\D/g, "");
        const phoneD = (r.clientPhone ?? "").replace(/\D/g, "");
        if (docD.includes(digits) || phoneD.includes(digits)) return true;
      }
      return false;
    });
  }, [data, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      for (const { key, dir } of sorts) {
        const av = a[key as keyof SalesReportRow];
        const bv = b[key as keyof SalesReportRow];
        let cmp: number;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR");
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return arr;
  }, [filtered, sorts]);

  const totals = useMemo(
    () => ({
      count: filtered.length,
      total: filtered.reduce((s, r) => s + r.grossAmount, 0),
    }),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { setPage(1); }, [search, pageSize, data]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageStart = (page - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, sorted.length);
  const paginated = sorted.slice(pageStart, pageEnd);

  return (
    <div className="flex flex-col min-w-0 w-full h-full min-h-0 gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por vendedor, cliente, documento, telefone..."
            className="h-8 pl-7 pr-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>{n} / página</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-muted-foreground border rounded-md">
          Nenhuma venda no período selecionado.
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10 text-center text-xs text-muted-foreground border rounded-md">
          Nenhum resultado para "{search}".
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 rounded-md border">
          <table className="w-full table-fixed text-[11px] leading-tight">
            <colgroup>
              <col className="w-[30px]" />
              <col className="w-[14%]" />
              <col />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
              <tr className="border-b">
                <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">#</th>
                <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                  <SortHeader label="Vendedor" k="userName" sorts={sorts} onSort={handleSort} />
                </th>
                <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                  <SortHeader label="Cliente" k="clientName" sorts={sorts} onSort={handleSort} />
                </th>
                <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                  <SortHeader label="Pagamento" k="paymentMethod" sorts={sorts} onSort={handleSort} />
                </th>
                <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                  <SortHeader label="Valor" k="grossAmount" sorts={sorts} onSort={handleSort} align="right" />
                </th>
                <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">Parc.</th>
                <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                  <SortHeader label="Data" k="saleDate" sorts={sorts} onSort={handleSort} align="right" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, i) => (
                <tr key={r.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-muted-foreground">{pageStart + i + 1}</td>
                  <td className="px-1.5 py-1.5 font-medium truncate" title={r.userName}>{r.userName}</td>
                  <td className="px-1.5 py-1.5 min-w-0">
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-medium truncate" title={r.clientName}>{r.clientName}</span>
                      {r.clientDocument && (
                        <span className="text-[10px] text-muted-foreground truncate">{r.clientDocument}</span>
                      )}
                      {r.clientPhone && (
                        <span className="text-[10px] text-muted-foreground truncate">{formatPhone(r.clientPhone)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 truncate text-muted-foreground">{r.paymentMethod}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap font-semibold text-primary">
                    {fmtCurrency(r.grossAmount)}
                  </td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-muted-foreground">{r.installments}x</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {formatDate(r.saleDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2 text-xs">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" className="h-7 w-7 p-0"
            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Página anterior">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-muted-foreground tabular-nums">
            {sorted.length === 0 ? 0 : pageStart + 1}–{pageEnd} de {sorted.length}
          </span>
          <Button type="button" size="sm" variant="outline" className="h-7 w-7 p-0"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Próxima página">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <span className="text-muted-foreground">pág. {page}/{totalPages}</span>
        </div>
        <div className="flex flex-wrap gap-x-4">
          <span className="text-muted-foreground">
            Total: <span className="font-semibold text-primary tabular-nums">{fmtCurrency(totals.total)}</span>
          </span>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground -mt-1">
        Dica: Shift+clique no cabeçalho para ordenar por mais de uma coluna.
      </div>
    </div>
  );
}
