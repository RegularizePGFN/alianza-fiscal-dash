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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, Eye, Wand2, Trash2, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Props {
  items: ClientRegistration[];
  loading: boolean;
  canManage: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  attachmentsSet: Set<string>;
  onOpen: (r: ClientRegistration) => void;
  onEdit: (r: ClientRegistration) => void;
  onGenerateSimulation: (r: ClientRegistration) => void;
  onDelete: (r: ClientRegistration) => void;
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
  canManage,
  isAdmin,
  currentUserId,
  attachmentsSet,
  onOpen,
  onEdit,
  onGenerateSimulation,
  onDelete,
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
  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ / CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Backoffice</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atendido em</TableHead>
              <TableHead>Tempo de cadastro</TableHead>
              <TableHead className="w-[60px]" />
              <TableHead className="w-[170px]">Gerar proposta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => {
              const canEdit =
                canManage ||
                (r.salesperson_id === currentUserId && r.status === "aguardando");
              const canDelete = isAdmin;
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
                  <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                  <TableCell>{r.client_name || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.cnpj || r.cpf || "—"}
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
                  <TableCell>{r.backoffice_name || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(r.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(r.completed_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpen(r)}>
                          <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(r)}>
                            <Edit3 className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(r)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!canGenerate}
                            onClick={() => onGenerateSimulation(r)}
                            className="h-8"
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
