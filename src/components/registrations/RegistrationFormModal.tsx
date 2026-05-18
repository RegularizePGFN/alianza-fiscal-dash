import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClientRegistration,
  REGISTRATION_REASONS,
  REGISTRATION_STATUSES,
  useSaveRegistration,
} from "@/hooks/useRegistrations";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  item: ClientRegistration | null;
}

export function RegistrationFormModal({ open, onClose, item }: Props) {
  const { user } = useAuth();
  const save = useSaveRegistration();
  const [form, setForm] = useState<any>({});

  const isAdminish =
    user?.role === UserRole.ADMIN || user?.role === UserRole.BACKOFFICE;

  useEffect(() => {
    if (open) {
      setForm(
        item || {
          client_name: "",
          client_phone: "",
          cnpj: "",
          cpf: "",
          reason: "fazer_cadastro",
          status: "aguardando",
          notes: "",
        }
      );
    }
  }, [open, item]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.cnpj?.trim() || !form.client_phone?.trim()) return;

    const payload: any = {
      ...form,
      client_name: form.client_name?.trim() || null,
      client_phone: form.client_phone?.trim() || null,
      cnpj: form.cnpj?.trim(),
      cpf: form.cpf?.trim() || null,
      notes: form.notes?.trim() || null,
    };

    if (!item) {
      payload.salesperson_id = user?.id;
      payload.salesperson_name = user?.name;
    }
    await save.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar cadastro" : "Novo cadastro"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>CNPJ *</Label>
            <Input
              value={form.cnpj || ""}
              onChange={(e) => set("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <Label>
              CPF{" "}
              <span className="ml-1 text-[10px] uppercase tracking-wide text-primary font-semibold">
                recomendado
              </span>
            </Label>
            <Input
              value={form.cpf || ""}
              onChange={(e) => set("cpf", e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <Label>Telefone *</Label>
            <Input
              value={form.client_phone || ""}
              onChange={(e) => set("client_phone", e.target.value)}
              placeholder="5511999999999"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Nome do cliente</Label>
            <Input
              value={form.client_name || ""}
              onChange={(e) => set("client_name", e.target.value)}
              placeholder="Razão social ou nome (opcional)"
            />
          </div>
          <div>
            <Label>Motivo *</Label>
            <Select value={form.reason} onValueChange={(v) => set("reason", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGISTRATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isAdminish && item && (
            <div className="md:col-span-2">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGISTRATION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Algo importante para o backoffice"
            />
          </div>
          <div className="md:col-span-2 text-xs text-muted-foreground">
            O CNPJ é obrigatório. O CPF é recomendado para agilizar o atendimento.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={save.isPending || !form.cnpj?.trim()}
          >
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
