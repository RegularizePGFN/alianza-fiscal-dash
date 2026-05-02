import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BucketRow, ConversionRow } from "@/hooks/useCommercialIntel";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  buckets?: BucketRow[];
  rows?: ConversionRow[];
  loading: boolean;
}

const bucketColor: Record<string, string> = {
  "Mesmo dia": "bg-emerald-500",
  "1 dia": "bg-teal-500",
  "2-3 dias": "bg-cyan-500",
  "4-7 dias": "bg-blue-500",
  "8-15 dias": "bg-violet-500",
  "16-30 dias": "bg-pink-500",
  ">30 dias": "bg-rose-500",
};

export function ConversionTimeTab({ buckets, rows, loading }: Props) {
  const [q, setQ] = useState("");

  if (loading) return <Skeleton className="h-[500px] w-full" />;

  const matched = (rows || []).filter((r) => r.proposal_id);
  const totalMatched = matched.length;
  const maxBucket = Math.max(...(buckets || []).map((b) => b.count), 1);

  const filteredRows = matched.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.client_name?.toLowerCase().includes(s) ||
      r.salesperson_name?.toLowerCase().includes(s) ||
      r.cnpj_normalized?.includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="font-semibold">Distribuição do tempo até a venda</h3>
            <p className="text-sm text-muted-foreground">
              Em quantos dias depois de criar a proposta o vendedor fechou a venda.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalMatched} venda{totalMatched === 1 ? "" : "s"} convertida{totalMatched === 1 ? "" : "s"}
          </div>
        </div>

        <div className="space-y-2">
          {(buckets || []).map((b) => {
            const pct = (b.count / maxBucket) * 100;
            const sharePct = totalMatched > 0 ? (b.count / totalMatched) * 100 : 0;
            return (
              <div key={b.bucket} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">{b.bucket}</div>
                <div className="flex-1 h-7 bg-muted/40 rounded relative overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${bucketColor[b.bucket] || "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end px-2 text-xs font-medium">
                    {b.count} • {sharePct.toFixed(0)}% • {fmtMoney(b.total_value)}
                  </div>
                </div>
              </div>
            );
          })}
          {(!buckets || buckets.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma venda convertida no período.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <h3 className="font-semibold">Vendas convertidas</h3>
          <div className="ml-auto relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, vendedor ou CNPJ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Proposta</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead className="text-center">Dias</TableHead>
                <TableHead className="text-right">Valor proposto</TableHead>
                <TableHead className="text-right">Valor vendido</TableHead>
                <TableHead className="text-right">Desc. real</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((r) => {
                const desc =
                  r.proposal_total_debt && r.proposal_total_debt > 0
                    ? ((r.proposal_total_debt - r.sale_amount) / r.proposal_total_debt) * 100
                    : null;
                return (
                  <TableRow key={r.sale_id}>
                    <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.client_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {r.cnpj_normalized}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.proposal_created_at &&
                        format(parseISO(r.proposal_created_at), "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(parseISO(r.sale_date), "dd/MM/yy")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={r.days_to_convert === 0 ? "default" : "secondary"}>
                        {r.days_to_convert}d
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.proposal_total_debt ? fmtMoney(r.proposal_total_debt) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmtMoney(r.sale_amount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {desc !== null ? `${desc.toFixed(1)}%` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    Nenhum registro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
