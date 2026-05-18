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
import { MoreHorizontal, Eye, Wand2, Trash2, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Props {
  items: ClientRegistration[];
  loading: boolean;
  canManage: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onOpen: (r: ClientRegistration) => void;
  onEdit: (r: ClientRegistration) => void;
  onGenerateSimulation: (r: ClientRegistration) => void;
  onDelete: (r: ClientRegistration) => void;
}

const fmt = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yy HH:mm") : "—");

export function RegistrationsTable({
  items,
  loading,
  canManage,
  isAdmin,
  currentUserId,
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
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => {
            const canEdit =
              canManage ||
              (r.salesperson_id === currentUserId && r.status === "aguardando");
            const canDelete =
              isAdmin ||
              (r.salesperson_id === currentUserId && r.status === "aguardando");
            return (
              <TableRow
                key={r.id}
                className="cursor-pointer"
                onClick={() => onOpen(r)}
              >
                <TableCell className="font-medium">{r.salesperson_name}</TableCell>
                <TableCell>{r.client_name}</TableCell>
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
                      <DropdownMenuItem onClick={() => onGenerateSimulation(r)}>
                        <Wand2 className="w-4 h-4 mr-2" /> Gerar simulação
                      </DropdownMenuItem>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
