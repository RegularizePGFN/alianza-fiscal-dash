import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, ArrowUpDown, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTodayProposals, TodayProposal } from "./useTodayProposals";

type SortKey = "userName" | "clientName" | "totalDebt" | "discountedValue" | "discountPercentage" | "feesValue" | "createdAt";
type SortDir = "asc" | "desc";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCnpj = (cnpj: string | null) => {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}

function SortableHeader({ label, sortKey, currentKey, currentDir, onSort, align = "left" }: SortableHeaderProps) {
  const active = currentKey === sortKey;
  const Icon = !active ? ArrowUpDown : currentDir === "desc" ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors ${
        active ? "text-foreground" : "text-muted-foreground"
      } ${align === "right" ? "flex-row-reverse w-full justify-start" : ""}`}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" />
    </button>
  );
}

export function TodayProposalsCard() {
  const { data, isLoading } = useTodayProposals(true);
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
    const arr = [...(data || [])];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""), "pt-BR");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const totals = useMemo(() => {
    const list = data || [];
    return {
      count: list.length,
      totalDebt: list.reduce((s, p) => s + p.totalDebt, 0),
      fees: list.reduce((s, p) => s + p.feesValue, 0),
    };
  }, [data]);

  const todayLabel = format(new Date(), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold">Propostas Geradas Hoje</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{todayLabel}</Badge>
          <Badge variant="outline">
            {totals.count} {totals.count === 1 ? "proposta" : "propostas"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma proposta gerada hoje ainda.
          </div>
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader label="Vendedor" sortKey="userName" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    </TableHead>
                    <TableHead>
                      <SortableHeader label="Cliente / CNPJ" sortKey="clientName" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader label="Valor Original" sortKey="totalDebt" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader label="Valor c/ Desc." sortKey="discountedValue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader label="Desc. %" sortKey="discountPercentage" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader label="Honorários" sortKey="feesValue" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                    </TableHead>
                    <TableHead className="text-right">
                      <SortableHeader label="Hora" sortKey="createdAt" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} align="right" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((p: TodayProposal) => {
                    const created = new Date(p.createdAt);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.userName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{p.clientName}</span>
                            <span className="text-xs text-muted-foreground">{formatCnpj(p.cnpj)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.totalDebt)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(p.discountedValue)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.discountPercentage.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-primary">
                          {formatCurrency(p.feesValue)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{format(created, "HH:mm", { locale: ptBR })}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(created, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t pt-3 text-sm">
              <div className="text-muted-foreground">
                Total Original:{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(totals.totalDebt)}
                </span>
              </div>
              <div className="text-muted-foreground">
                Total Honorários:{" "}
                <span className="font-semibold text-primary tabular-nums">
                  {formatCurrency(totals.fees)}
                </span>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
