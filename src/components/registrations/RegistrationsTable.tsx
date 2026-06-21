import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClientRegistration,
  reasonLabel,
  statusLabel,
  statusClasses,
} from "@/hooks/useRegistrations";
import { formatDocument } from "@/lib/formatters/document";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wand2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AutomationStatusBadge } from "./AutomationStatusBadge";

interface Props {
  items: ClientRegistration[];
  loading: boolean;
  canManage: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  attachmentsSet: Set<string>;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[], checked: boolean) => void;
  onOpen: (r: ClientRegistration) => void;
  onGenerateSimulation: (r: ClientRegistration) => void;
}

const fmt = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yy HH:mm") : "—");

const fmtDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return "—";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(diffMs) || diffMs < 0) return "—";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

export function RegistrationsTable({
  items,
  loading,
  isAdmin,
  attachmentsSet,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpen,
  onGenerateSimulation,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="border rounded-lg p-10 text-center text-muted-foreground">
        Nenhum cadastro encontrado para os filtros atuais.
      </div>
    );
  }
  const allIds = items.map((r) => r.id);
  const allSelected = allIds.every((id) => selectedIds.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedIds.has(id));
  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(c) => onToggleSelectAll(allIds, !!c)}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              )}
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ / CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Backoffice</TableHead>
              <TableHead>Automação</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atendido em</TableHead>
              <TableHead>Tempo de cadastro</TableHead>
              <TableHead className="w-[170px]">Gerar proposta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => {
              const hasAttachment = attachmentsSet.has(r.id);
              const canGenerate = r.status === "realizado" && hasAttachment;
              const tip = !canGenerate
                ? r.status !== "realizado"
                  ? "Disponível quando o cadastro estiver Realizado"
                  : "Anexe o print do cadastro concluído"
                : "Gerar proposta a partir do print";
              return (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => onOpen(r)}
                >
                  {isAdmin && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(r.id)}
                        onCheckedChange={() => onToggleSelect(r.id)}
                        aria-label="Selecionar cadastro"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                  <TableCell>{r.client_name || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatDocument(r.cnpj || r.cpf || "") || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.client_phone || "—"}</TableCell>
                  <TableCell>{reasonLabel(r.reason)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${statusClasses(
                        r.status
                      )}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.backoffice_name
                      ? r.backoffice_name
                      : r.processing_mode === "automatico"
                      ? <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">AUTOMAÇÃO</span>
                      : "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {r.processing_mode === "automatico" && !r.backoffice_name ? (
                      <AutomationStatusBadge registration={r} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(r.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(r.completed_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {r.processing_mode === "automatico"
                      ? fmtDuration(r.automation_started_at, r.automation_finished_at)
                      : fmtDuration(r.created_at, r.completed_at)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            size="sm"
                            variant={canGenerate ? "default" : "secondary"}
                            disabled={!canGenerate}
                            onClick={() => onGenerateSimulation(r)}
                            className={
                              canGenerate
                                ? "h-8 bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-sm"
                                : "h-8"
                            }
                          >
                            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                            Gerar proposta
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{tip}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
