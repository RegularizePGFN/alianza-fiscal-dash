import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { EquipmentWithAssignment, statusBadgeVariant, statusLabel, typeLabel } from "@/hooks/useInventory";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  items: EquipmentWithAssignment[];
  isLoading: boolean;
  onEdit: (item: EquipmentWithAssignment) => void;
  onAssignToggle: (item: EquipmentWithAssignment) => void;
  onDelete: (item: EquipmentWithAssignment) => void;
}

export function InventoryTable({ items, isLoading, onEdit, onAssignToggle, onDelete }: Props) {
  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }
  if (!items.length) {
    return <div className="text-center py-12 text-muted-foreground">Nenhum equipamento encontrado.</div>;
  }
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Tag</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Com quem</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id}>
              <TableCell className="font-mono text-xs">{it.tag}</TableCell>
              <TableCell>
                <div className="font-medium">{it.name}</div>
                {(it.brand || it.model) && (
                  <div className="text-xs text-muted-foreground">{[it.brand, it.model].filter(Boolean).join(" ")}</div>
                )}
              </TableCell>
              <TableCell>{typeLabel(it.type)}</TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(it.status)}>{statusLabel(it.status)}</Badge>
              </TableCell>
              <TableCell>{it.current_assignment?.user_name || <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell className="text-sm">
                {it.current_assignment
                  ? format(parseISO(it.current_assignment.assigned_at), "dd/MM/yyyy", { locale: ptBR })
                  : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {(it.status === "disponivel" || it.status === "em_uso") && (
                    <Button size="sm" variant="outline" onClick={() => onAssignToggle(it)}>
                      <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                      {it.status === "em_uso" ? "Devolver" : "Atribuir"}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => onEdit(it)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(it)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
