import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Equipment,
  EQUIPMENT_TYPES,
  EQUIPMENT_CONDITIONS,
  useSaveEquipment,
} from "@/hooks/useInventory";

interface Props {
  open: boolean;
  onClose: () => void;
  item: Equipment | null;
}

const STATUS_MANUAL = [
  { value: "disponivel", label: "Disponível" },
  { value: "manutencao", label: "Manutenção" },
  { value: "aposentado", label: "Aposentado" },
];

export function EquipmentFormModal({ open, onClose, item }: Props) {
  const save = useSaveEquipment();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open) {
      setForm(item || {
        name: "",
        type: "notebook",
        condition: "bom",
        status: "disponivel",
      });
    }
  }, [open, item]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    await save.mutateAsync({
      ...form,
      acquisition_value: form.acquisition_value ? Number(form.acquisition_value) : null,
    });
    onClose();
  };

  // If item is currently in_use, lock status (managed via assignment)
  const statusLocked = item?.status === "em_uso";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar equipamento" : "Novo equipamento"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Nome *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Ex.: Notebook Dell Latitude" />
          </div>
          <div>
            <Label>Tipo *</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tag (deixe vazio para gerar)</Label>
            <Input value={form.tag || ""} onChange={(e) => set("tag", e.target.value)} placeholder="EQ-0001" />
          </div>
          <div>
            <Label>Marca</Label>
            <Input value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input value={form.model || ""} onChange={(e) => set("model", e.target.value)} />
          </div>
          <div>
            <Label>Nº de série</Label>
            <Input value={form.serial_number || ""} onChange={(e) => set("serial_number", e.target.value)} />
          </div>
          <div>
            <Label>IMEI</Label>
            <Input value={form.imei || ""} onChange={(e) => set("imei", e.target.value)} />
          </div>
          <div>
            <Label>Data de aquisição</Label>
            <Input type="date" value={form.acquisition_date || ""} onChange={(e) => set("acquisition_date", e.target.value)} />
          </div>
          <div>
            <Label>Valor de aquisição</Label>
            <Input type="number" step="0.01" value={form.acquisition_value ?? ""} onChange={(e) => set("acquisition_value", e.target.value)} />
          </div>
          <div>
            <Label>Condição</Label>
            <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EQUIPMENT_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)} disabled={statusLocked}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_MANUAL.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                {statusLocked && <SelectItem value="em_uso">Em uso</SelectItem>}
              </SelectContent>
            </Select>
            {statusLocked && (
              <p className="text-xs text-muted-foreground mt-1">Item em uso — devolva-o para mudar o status.</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Observações</Label>
            <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={save.isPending || !form.name?.trim()}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
