import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  EquipmentWithAssignment,
  EQUIPMENT_CONDITIONS,
  conditionLabel,
  useAssignEquipment,
  useReturnEquipment,
  useEquipmentHistory,
  useUsersForAssignment,
} from "@/hooks/useInventory";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onClose: () => void;
  item: EquipmentWithAssignment | null;
}

export function AssignmentModal({ open, onClose, item }: Props) {
  const isReturn = item?.status === "em_uso";
  const assign = useAssignEquipment();
  const ret = useReturnEquipment();
  const { data: users = [] } = useUsersForAssignment();
  const { data: history = [] } = useEquipmentHistory(open ? item?.id || null : null);

  const today = new Date().toISOString().slice(0, 10);
  const [userId, setUserId] = useState<string>("");
  const [date, setDate] = useState(today);
  const [condition, setCondition] = useState<string>("bom");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setUserId("");
      setDate(today);
      setCondition(item?.condition || "bom");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  const handleSubmit = async () => {
    if (!item) return;
    if (isReturn) {
      if (!item.current_assignment) return;
      await ret.mutateAsync({
        assignment_id: item.current_assignment.id,
        equipment_id: item.id,
        returned_at: date,
        condition_on_return: condition,
        notes: notes || undefined,
      });
    } else {
      if (!userId) return;
      const u = users.find((x: any) => x.id === userId);
      await assign.mutateAsync({
        equipment_id: item.id,
        user_id: userId,
        user_name: u?.name || u?.email || "—",
        assigned_at: date,
        condition_on_assign: condition,
        notes: notes || undefined,
      });
    }
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isReturn ? "Devolver equipamento" : "Atribuir equipamento"} — {item.tag}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isReturn ? (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div>Em uso por <strong>{item.current_assignment?.user_name}</strong></div>
              <div className="text-muted-foreground text-xs">
                Desde {item.current_assignment && format(parseISO(item.current_assignment.assigned_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </div>
          ) : (
            <div>
              <Label>Colaborador *</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{isReturn ? "Data da devolução" : "Data da entrega"}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>{isReturn ? "Condição na devolução" : "Condição na entrega"}</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observação</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {history.length > 0 && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Histórico</Label>
              <div className="mt-2 max-h-44 overflow-y-auto rounded-md border divide-y">
                {history.map((h) => (
                  <div key={h.id} className="p-2 text-sm flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{h.user_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(h.assigned_at), "dd/MM/yyyy", { locale: ptBR })} —{" "}
                        {h.returned_at ? format(parseISO(h.returned_at), "dd/MM/yyyy", { locale: ptBR }) : "ativo"}
                      </div>
                    </div>
                    {h.condition_on_return && (
                      <Badge variant="outline" className="text-xs">Devolvido: {conditionLabel(h.condition_on_return)}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={(assign.isPending || ret.isPending) || (!isReturn && !userId)}
          >
            {assign.isPending || ret.isPending ? "Salvando..." : isReturn ? "Registrar devolução" : "Atribuir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
