import { useMemo, useState } from "react";
import { InventoryKpiCards } from "./InventoryKpiCards";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { EquipmentFormModal } from "./EquipmentFormModal";
import { AssignmentModal } from "./AssignmentModal";
import {
  EquipmentWithAssignment,
  useDeleteEquipment,
  useEquipmentList,
} from "@/hooks/useInventory";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function InventoryContainer() {
  const { data: items = [], isLoading } = useEquipmentList();
  const del = useDeleteEquipment();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentWithAssignment | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<EquipmentWithAssignment | null>(null);

  const [deleteItem, setDeleteItem] = useState<EquipmentWithAssignment | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (status !== "all" && i.status !== status) return false;
      if (!q) return true;
      return [
        i.tag, i.name, i.brand, i.model,
        i.current_assignment?.user_name,
      ].some((v) => v && v.toLowerCase().includes(q));
    });
  }, [items, search, type, status]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Inventário</h1>
        <p className="text-sm text-muted-foreground">Equipamentos da empresa e quem está com cada um.</p>
      </div>

      <InventoryKpiCards items={items} />

      <InventoryFilters
        search={search} onSearch={setSearch}
        type={type} onType={setType}
        status={status} onStatus={setStatus}
        onNew={() => { setEditing(null); setFormOpen(true); }}
      />

      <InventoryTable
        items={filtered}
        isLoading={isLoading}
        onEdit={(it) => { setEditing(it); setFormOpen(true); }}
        onAssignToggle={(it) => { setAssignItem(it); setAssignOpen(true); }}
        onDelete={(it) => setDeleteItem(it)}
      />

      <EquipmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
      />

      <AssignmentModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        item={assignItem}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteItem?.tag} — {deleteItem?.name}. Essa ação remove também todo o histórico de uso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteItem) await del.mutateAsync(deleteItem.id);
                setDeleteItem(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
