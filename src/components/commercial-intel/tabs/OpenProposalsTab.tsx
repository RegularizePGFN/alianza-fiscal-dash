import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OpenProposalRow } from "@/hooks/useCommercialIntel";
import { format, parseISO } from "date-fns";
import { Search, MessageCircle, Flame } from "lucide-react";

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  data?: OpenProposalRow[];
  loading: boolean;
}

const agingBadge = (d: number) => {
  if (d <= 3) return { label: `${d}d`, color: "bg-emerald-500/20 text-emerald-400" };
  if (d <= 7) return { label: `${d}d`, color: "bg-blue-500/20 text-blue-400" };
  if (d <= 15) return { label: `${d}d`, color: "bg-amber-500/20 text-amber-400" };
  return { label: `${d}d`, color: "bg-rose-500/20 text-rose-400" };
};

export function OpenProposalsTab({ data, loading }: Props) {
  const [q, setQ] = useState("");
  const [agingFilter, setAgingFilter] = useState<string>("all");

  if (loading) return <Skeleton className="h-[500px] w-full" />;

  const filtered = useMemo(() => {
    let rows = data || [];
    if (agingFilter !== "all") {
      rows = rows.filter((r) => {
        if (agingFilter === "0-3") return r.aging_days <= 3;
        if (agingFilter === "4-7") return r.aging_days > 3 && r.aging_days <= 7;
        if (agingFilter === "8-15") return r.aging_days > 7 && r.aging_days <= 15;
        if (agingFilter === ">15") return r.aging_days > 15;
        return true;
      });
    }
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.client_name?.toLowerCase().includes(s) ||
          r.salesperson_name?.toLowerCase().includes(s) ||
          r.cnpj?.includes(s),
      );
    }
    return rows.sort((a, b) => b.aging_days - a.aging_days);
  }, [data, agingFilter, q]);

  const totalValue = filtered.reduce((s, r) => s + (r.total_debt || 0), 0);
  const hotCount = filtered.filter((r) => r.aging_days > 7 && r.total_debt > 50000).length;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Propostas em aberto
              {hotCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="h-3 w-3" />
                  {hotCount} oportunidade{hotCount === 1 ? "" : "s"} quente{hotCount === 1 ? "" : "s"}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filtered.length} proposta{filtered.length === 1 ? "" : "s"} sem venda correspondente • Valor total{" "}
              {fmtMoney(totalValue)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, vendedor ou CNPJ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={agingFilter} onValueChange={setAgingFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os agings</SelectItem>
              <SelectItem value="0-3">0 a 3 dias</SelectItem>
              <SelectItem value="4-7">4 a 7 dias</SelectItem>
              <SelectItem value="8-15">8 a 15 dias</SelectItem>
              <SelectItem value=">15">Mais de 15 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className="h-[480px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Aging</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Valor original</TableHead>
              <TableHead className="text-right">Valor c/ desconto</TableHead>
              <TableHead className="text-right">Honorário</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const a = agingBadge(r.aging_days);
              const isHot = r.aging_days > 7 && r.total_debt > 50000;
              return (
                <TableRow key={r.proposal_id} className={isHot ? "bg-rose-500/5" : ""}>
                  <TableCell>
                    <Badge className={a.color} variant="secondary">
                      {a.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {r.client_name}
                    {isHot && <Flame className="inline h-3 w-3 ml-1 text-rose-400" />}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {r.cnpj}
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(parseISO(r.created_at), "dd/MM/yy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtMoney(r.total_debt)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtMoney(r.discounted_value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtMoney(r.fees_value)}</TableCell>
                  <TableCell className="text-center">
                    {r.client_phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 text-emerald-500 hover:text-emerald-400"
                      >
                        <a
                          href={`https://wa.me/${r.client_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                  Nenhuma proposta em aberto no período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
