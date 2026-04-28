import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TodayProposal } from "./useTodayProposals";

type SortKey = "userName" | "clientName" | "totalDebt" | "discountedValue" | "feesValue" | "createdAt";
type SortDir = "asc" | "desc";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCnpj = (cnpj: string | null) => {
  if (!cnpj) return "—";
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

interface HeaderProps {
  label: string;
  k: SortKey;
  cur: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}

function SortHeader({ label, k, cur, dir, onSort, align = "left" }: HeaderProps) {
  const active = cur === k;
  const Icon = !active ? ArrowUpDown : dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
        active ? "text-foreground" : "text-muted-foreground"
      } ${align === "right" ? "flex-row-reverse w-full justify-start" : ""}`}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" />
    </button>
  );
}

interface Props {
  data: TodayProposal[];
}

export function TodayProposalsTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("feesValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "userName" || k === "clientName" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir]);

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
            <col className="w-[44px]" />
            <col className="w-[18%]" />
            <col />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
            <tr className="border-b">
              <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                <SortHeader label="Hora" k="createdAt" cur={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                <SortHeader label="Vendedor" k="userName" cur={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-1.5 py-1.5 text-left font-medium text-muted-foreground">
                <SortHeader label="Cliente / CNPJ" k="clientName" cur={sortKey} dir={sortDir} onSort={handleSort} />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="V. Original" k="totalDebt" cur={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="V. c/ Desc." k="discountedValue" cur={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              </th>
              <th className="px-1.5 py-1.5 text-right font-medium text-muted-foreground">
                <SortHeader label="Honor." k="feesValue" cur={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const created = new Date(p.createdAt);
              return (
                <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="px-1.5 py-1.5 tabular-nums text-muted-foreground">
                    {format(created, "HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-1.5 py-1.5 font-medium truncate" title={p.userName}>{p.userName}</td>
                  <td className="px-1.5 py-1.5 min-w-0">
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-medium truncate" title={p.clientName}>{p.clientName}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{formatCnpj(p.cnpj)}</span>
                    </div>
                  </td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap">{fmtCurrency(p.totalDebt)}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap">{fmtCurrency(p.discountedValue)}</td>
                  <td className="px-1.5 py-1.5 text-right tabular-nums whitespace-nowrap font-semibold text-primary">
                    {fmtCurrency(p.feesValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2 text-xs">
        <span className="text-muted-foreground">
          {totals.count} {totals.count === 1 ? "proposta" : "propostas"}
        </span>
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
