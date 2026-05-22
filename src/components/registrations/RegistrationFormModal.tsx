import { useCallback, useEffect, useRef, useState } from "react";
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
  useAddAttachment,
  useRegistrationAttachments,
  useSaveRegistration,
} from "@/hooks/useRegistrations";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { AttachmentsField } from "./AttachmentsField";
import { usePasteImage } from "@/hooks/usePasteImage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clipboard, Upload, X, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  item: ClientRegistration | null;
}

export function RegistrationFormModal({ open, onClose, item }: Props) {
  const { user } = useAuth();
  const save = useSaveRegistration();
  const add = useAddAttachment();
  const [form, setForm] = useState<any>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingPending, setUploadingPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdminish =
    user?.role === UserRole.ADMIN || user?.role === UserRole.BACKOFFICE;

  const { data: existingAttachments = [] } = useRegistrationAttachments(
    item?.id ?? null
  );

  useEffect(() => {
    if (open) {
      setForm(
        item || {
          client_name: "",
          client_phone: "",
          cnpj: "",
          cpf: "",
          mother_name: "",
          reason: "fazer_cadastro",
          status: "aguardando",
          processing_mode: "automatico",
          notes: "",
        }
      );
      setPendingFiles([]);
    }
  }, [open, item]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const queueFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} print(s) na fila`);
  }, []);

  // Paste handler — only when creating new (no item). When editing, AttachmentsField handles paste.
  usePasteImage(
    useCallback((file: File) => queueFiles([file]), [queueFiles]),
    open && !item
  );

  const uploadPendingFor = async (registrationId: string) => {
    if (!pendingFiles.length || !user) return;
    setUploadingPending(true);
    try {
      for (const file of pendingFiles) {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `${registrationId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("cadastro-prints")
          .upload(path, file, { contentType: file.type || "image/png" });
        if (error) throw error;
        const { data } = supabase.storage
          .from("cadastro-prints")
          .getPublicUrl(path);
        await add.mutateAsync({
          registration_id: registrationId,
          file_url: data.publicUrl,
          uploaded_by: user.id,
          uploaded_by_name: user.name,
        });
      }
      toast.success("Prints anexados ao cadastro");
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar prints");
    } finally {
      setUploadingPending(false);
    }
  };

  const onlyDigits = (s: string) => (s ?? "").replace(/\D/g, "");
  const isValidCPF = (raw: string) => {
    const c = onlyDigits(raw);
    if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
    let d = 11 - (s % 11); if (d >= 10) d = 0;
    if (d !== parseInt(c[9])) return false;
    s = 0;
    for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
    d = 11 - (s % 11); if (d >= 10) d = 0;
    return d === parseInt(c[10]);
  };
  const isValidCNPJ = (raw: string) => {
    const c = onlyDigits(raw);
    if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
    const calc = (len: number) => {
      const w = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      let s = 0;
      for (let i = 0; i < len; i++) s += parseInt(c[i]) * w[i];
      const r = s % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(12) === parseInt(c[12]) && calc(13) === parseInt(c[13]);
  };

  const handleSave = async () => {
    if (!form.cnpj?.trim() || !form.client_phone?.trim()) return;

    const cnpjDigits = onlyDigits(form.cnpj);
    if (cnpjDigits.length !== 14 || !isValidCNPJ(cnpjDigits)) {
      toast.error("CNPJ inválido. Verifique os 14 dígitos.");
      return;
    }
    const cpfRaw = form.cpf?.trim();
    if (cpfRaw) {
      const cpfDigits = onlyDigits(cpfRaw);
      if (cpfDigits.length !== 11 || !isValidCPF(cpfDigits)) {
        toast.error("CPF inválido. Verifique os 11 dígitos.");
        return;
      }
    }


    const payload: any = {
      ...form,
      client_name: form.client_name?.trim() || null,
      client_phone: form.client_phone?.trim() || null,
      cnpj: form.cnpj?.trim(),
      cpf: form.cpf?.trim() || null,
      mother_name: form.mother_name?.trim() || null,
      processing_mode: form.processing_mode === "manual" ? "manual" : "automatico",
      notes: form.notes?.trim() || null,
    };

    if (!item) {
      payload.salesperson_id = user?.id;
      payload.salesperson_name = user?.name;
    } else if (!isAdminish) {
      // Vendedor editando o próprio cadastro: volta pra fila
      payload.status = "aguardando";
      payload.automation_status = "pending";
      payload.automation_started_at = null;
      payload.automation_finished_at = null;
      payload.automation_error = null;
      payload.backoffice_id = null;
      payload.backoffice_name = null;
      payload.completed_at = null;
    } else {
      // Admin/backoffice editando: se estava travado por dados ruins e agora
      // tem CPF+CNPJ válidos, recolocar na fila da automação
      const wasBlocked =
        item.automation_status === "dados_incompletos" ||
        item.automation_status === "dados_invalidos" ||
        item.automation_status === "error";
      if (wasBlocked && payload.processing_mode === "automatico" && !payload.backoffice_id) {
        payload.status = "aguardando";
        payload.automation_status = "pending";
        payload.automation_started_at = null;
        payload.automation_finished_at = null;
        payload.automation_error = null;
        payload.completed_at = null;
      }
    }
    const result = await save.mutateAsync(payload);
    if (pendingFiles.length && result?.id) {
      await uploadPendingFor(result.id);
    }
    onClose();
  };

  const handleFilesInput = (files: FileList | null) => {
    if (files) queueFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <Label>CPF</Label>
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
          <div className="md:col-span-2">
            <Label>Nome da mãe (opcional)</Label>
            <Input
              value={form.mother_name || ""}
              onChange={(e) => set("mother_name", e.target.value)}
              placeholder="Nome completo da mãe"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Modo de processamento *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={(form.processing_mode ?? "automatico") === "automatico"}
                  onChange={() => set("processing_mode", "automatico")}
                />
                <span className="font-medium">AUTOMÁTICO</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={form.processing_mode === "manual"}
                  onChange={() => set("processing_mode", "manual")}
                />
                <span className="font-medium">MANUAL</span>
              </label>
            </div>
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

          {/* Anexos */}
          <div className="md:col-span-2 pt-2 border-t">
            {item ? (
              <AttachmentsField
                registrationId={item.id}
                items={existingAttachments}
                canManage={true}
              />
            ) : (
              <div>
                <Label className="flex items-center gap-2">
                  Prints da simulação PGFN
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    <Clipboard className="w-3 h-3" /> Ctrl+V para colar
                  </span>
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingFiles.map((f, idx) => {
                    const url = URL.createObjectURL(f);
                    return (
                      <div
                        key={idx}
                        className="relative w-24 h-24 rounded-md overflow-hidden border bg-muted group"
                      >
                        <img
                          src={url}
                          alt={`Pendente ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remover"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Adicionar</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Os prints serão enviados ao salvar o cadastro.
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesInput(e.target.files)}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 text-xs text-muted-foreground">
            CNPJ e telefone são obrigatórios. Sem CPF o cadastro fica como "dados incompletos" e não entra no fluxo automático.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              save.isPending ||
              uploadingPending ||
              !form.cnpj?.trim() ||
              !form.client_phone?.trim()
            }
          >
            {save.isPending || uploadingPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
              </span>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
