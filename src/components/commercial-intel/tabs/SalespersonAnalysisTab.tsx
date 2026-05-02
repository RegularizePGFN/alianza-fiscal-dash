import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalespersonIntelRow } from "@/hooks/useCommercialIntel";
import { ChevronDown, ChevronUp } from "lucide-react";

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  data?: SalespersonIntelRow[];
  loading: boolean;
}

type SortKey = keyof SalespersonIntelRow;

function classify(r: SalespersonIntelRow): { label: string; color: string } {
  if (r.proposals_count === 0 && r.sales_count === 0)
    return { label: "Sem atividade", color: "bg-muted text-muted-foreground" };
  if (r.proposals_count >= 5 && r.conversion_rate >= 50 && r.avg_days_to_convert <= 1)
    return { label: "Caçador", color: "bg-emerald-500/20 text-emerald-400" };
  if (r.proposals_count >= 5 && r.conversion_rate >= 30)
    return { label: "Cultivador", color: "bg-blue-500/20 text-blue-400" };
  if (r.proposals_count >= 10 && r.conversion_rate < 20)
    return { label: "Volume", color: "bg-amber-500/20 text-amber-400" };
  if (r.proposals_count < 3)
    return { label: "Atenção", color: "bg-rose-500/20 text-rose-400" };
  return { label: "Equilibrado", color: "bg-violet-500/20 text-violet-400" };
}

export function SalespersonAnalysisTab({ data, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("sales_value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (loading) return <Skeleton className="h-[500px] w-full" />;

  const sorted = [...(data || [])].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const SortHead = ({ k, children, align = "left" }: { k: SortKey; children: any; align?: string }) => (
    <TableHead
      className={`cursor-pointer select-none ${align === "right" ? "text-right" : ""}`}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey === k &&
          (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
      </span>
    </TableHead>
  );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Análise por vendedor</h3>
        <p className="text-sm text-muted-foreground">
          Conversão real, ticket médio e desconto praticado. Clique nas colunas para ordenar.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead k="salesperson_name">Vendedor</SortHead>
              <TableHead>Perfil</TableHead>
              <SortHead k="proposals_count" align="right">Propostas</SortHead>
              <SortHead k="sales_count" align="right">Vendas</SortHead>
              <SortHead k="conversion_rate" align="right">Conv. %</SortHead>
              <SortHead k="avg_days_to_convert" align="right">Tempo médio</SortHead>
              <SortHead k="avg_proposal_value" align="right">Ticket prop.</SortHead>
              <SortHead k="avg_sale_value" align="right">Ticket venda</SortHead>
              <SortHead k="avg_discount_pct" align="right">Desc. médio</SortHead>
              <SortHead k="sales_value" align="right">Faturamento</SortHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => {
              const profile = classify(r);
              return (
                <TableRow key={r.salesperson_id}>
                  <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                  <TableCell>
                    <Badge className={profile.color} variant="secondary">
                      {profile.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.proposals_count}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.sales_count}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={
                        r.conversion_rate >= 40
                          ? "text-emerald-500 font-medium"
                          : r.conversion_rate >= 20
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }
                    >
                      {r.conversion_rate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.matched_sales_count > 0 ? `${r.avg_days_to_convert.toFixed(1)}d` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtMoney(r.avg_proposal_value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtMoney(r.avg_sale_value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.matched_sales_count > 0 ? `${r.avg_discount_pct.toFixed(1)}%` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {fmtMoney(r.sales_value)}
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                  Nenhum vendedor com atividade no período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
