import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TodayProposal } from "./useTodayProposals";

type SortKey = "userName" | "clientName" | "totalDebt" | "discountedValue" | "discountPercentage" | "feesValue" | "createdAt";
type SortDir = "asc" | "desc";

interface SortCriterion {
  key: SortKey;
  dir: SortDir;
}

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCnpj = (cnpj: string | null) => {
  if (!cnpj) return "—";
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const formatPhone = (phone: string | null) => {
  if (!phone) return "—";
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return phone;
};

const defaultDirFor = (k: SortKey): SortDir =>
  k === "userName" || k === "clientName" ? "asc" : "desc";

interface HeaderProps {
  label: string;
  k: SortKey;
  sorts: SortCriterion[];
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

interface Props {
  data: TodayProposal[];
}

export function TodayProposalsTable({ data }: Props) {
  const [sorts, setSorts] = useState<SortCriterion[]>([{ key: "feesValue", dir: "desc" }]);

  const handleSort = (k: SortKey, e: React.MouseEvent) => {
    const additive = e.shiftKey;
    setSorts((prev) => {
      const idx = prev.findIndex((s) => s.key === k);
      if (additive) {
        // shift+click: add new criterion or toggle direction if already present
        if (idx === -1) return [...prev, { key: k, dir: defaultDirFor(k) }];
        const next = [...prev];
        next[idx] = { key: k, dir: next[idx].dir === "asc" ? "desc" : "asc" };
        return next;
      }
      // plain click: if it's the only/primary key, toggle direction; else replace
      if (idx === 0 && prev.length === 1) {
        return [{ key: k, dir: prev[0].dir === "asc" ? "desc" : "asc" }];
      }
      return [{ key: k, dir: idx !== -1 ? prev[idx].dir : defaultDirFor(k) }];
    });
  };

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      for (const { key, dir } of sorts) {
        const av = a[key];
        const bv = b[key];
        let cmp: number;
        if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR");
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return arr;
  }, [data, sorts]);

  const totals = useMemo(
    () => ({
      count: data.length,
      totalDebt: data.reduce((s, p) => s + p.totalDebt, 0),
      fees: data.reduce((s, p) => s + p.feesValue, 0),
    }),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-muted-foreground">
        Nenhuma proposta gerada hoje ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <ScrollArea className="h-[420px] rounded-md border">
        <table className="w-full table-fixed text-[11px] leading-tight">
          <colgroup>
            <col className="w-[30px]" />
            <col className="w-[15%]" />
            <col />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[48px]" />
            <col className="w-[13%]" />
            <col className="w-[42px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
            <tr className="border-b">
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">#</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                <SortHeader label="Vendedor" k="userName" sorts={sorts} onSort={handleSort} />
              </th>
              <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                <SortHeader label="Cliente / CNPJ" k="clientName" sorts={sorts} onSort={handleSort} />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="V. Original" k="totalDebt" sorts={sorts} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="V. c/ Desc." k="discountedValue" sorts={sorts} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="% Desc." k="discountPercentage" sorts={sorts} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="Honor." k="feesValue" sorts={sorts} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="Hora" k="createdAt" sorts={sorts} onSort={handleSort} align="right" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const created = new Date(p.createdAt);
              const pct =
                p.discountPercentage > 0
                  ? p.discountPercentage
                  : p.totalDebt > 0
                  ? ((p.totalDebt - p.discountedValue) / p.totalDebt) * 100
                  : 0;
              return (
                <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="px-1.5 py-1.5 font-medium truncate" title={p.userName}>{p.userName}</td>
                  <td className="px-1.5 py-1.5 min-w-0">
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-medium truncate" title={p.clientName}>{p.clientName}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{formatCnpj(p.cnpj)}</span>
                      {p.clientPhone && (
                        <span className="text-[10px] text-muted-foreground truncate">{formatPhone(p.clientPhone)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap">{fmtCurrency(p.totalDebt)}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap">{fmtCurrency(p.discountedValue)}</td>
                  <td className={`px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap ${pct > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    {pct > 0 ? `${pct.toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap font-semibold text-primary">
                    {fmtCurrency(p.feesValue)}
                  </td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {format(created, "HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            {totals.count} {totals.count === 1 ? "proposta" : "propostas"}
          </span>
          <span className="hidden sm:inline text-[10px] text-muted-foreground">
            Dica: Shift+clique no cabeçalho para ordenar por mais de uma coluna.
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4">
          <span className="text-muted-foreground">
            Total Original:{" "}
            <span className="font-semibold text-foreground tabular-nums">{fmtCurrency(totals.totalDebt)}</span>
          </span>
          <span className="text-muted-foreground">
            Total Honorários:{" "}
            <span className="font-semibold text-primary tabular-nums">{fmtCurrency(totals.fees)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
