import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ClientRegistration,
  REGISTRATION_STATUSES,
  reasonLabel,
  statusClasses,
  statusLabel,
  useRegistrationAttachments,
  useRegistrationEvents,
  useUpdateRegistrationStatus,
} from "@/hooks/useRegistrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AttachmentsField } from "./AttachmentsField";
import { Wand2 } from "lucide-react";
import { formatCnpj, formatCpf } from "@/lib/formatters/document";

interface Props {
  open: boolean;
  onClose: () => void;
  item: ClientRegistration | null;
  canManage: boolean;
  onGenerateSimulation: (r: ClientRegistration) => void;
}

export function RegistrationDetailDrawer({
  open,
  onClose,
  item,
  canManage,
  onGenerateSimulation,
}: Props) {
  const { data: attachments = [] } = useRegistrationAttachments(item?.id || null);
  const { data: events = [] } = useRegistrationEvents(item?.id || null);
  const updateStatus = useUpdateRegistrationStatus();

  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item.client_name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Top info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Vendedor" value={item.salesperson_name} />
            <Info label="Telefone" value={item.client_phone || "—"} mono />
            <Info label="CNPJ" value={item.cnpj ? formatCnpj(item.cnpj) : "—"} mono />
            <Info label="CPF" value={item.cpf ? formatCpf(item.cpf) : "—"} mono />
            <Info label="Motivo" value={reasonLabel(item.reason)} />
            <div>
              <div className="text-xs text-muted-foreground">Situação</div>
              <span
                className={`inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-md border ${statusClasses(
                  item.status
                )}`}
              >
                {statusLabel(item.status)}
              </span>
            </div>
            <Info
              label="Criado em"
              value={format(new Date(item.created_at), "dd/MM/yyyy HH:mm")}
            />
            <Info
              label="Atendido em"
              value={
                item.completed_at
                  ? format(new Date(item.completed_at), "dd/MM/yyyy HH:mm")
                  : "—"
              }
            />
            <Info
              label="Backoffice"
              value={
                item.backoffice_name ||
                (item.processing_mode === "automatico" ? "AUTOMAÇÃO" : "—")
              }
            />
            <Info
              label="Automação"
              value={
                item.processing_mode === "automatico" && !item.backoffice_name
                  ? item.automation_status === "pending"
                    ? "Na fila"
                    : item.automation_status === "processing"
                    ? "Processando…"
                    : item.automation_status === "success"
                    ? "Sucesso"
                    : item.automation_status === "error"
                    ? "Erro"
                    : item.automation_status === "completed"
                    ? "Concluído"
                    : item.automation_status === "dados_incompletos"
                    ? "Dados incompletos"
                    : item.automation_status === "dados_invalidos"
                    ? "Dados inválidos"
                    : "—"
                  : "—"
              }
            />
          </div>

          {item.notes && (
            <div>
              <div className="text-xs text-muted-foreground">Observação</div>
              <div className="text-sm mt-1 whitespace-pre-wrap">{item.notes}</div>
            </div>
          )}

          {/* Status update */}
          {canManage && (
            <div className="border rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium">Atualizar situação</div>
              <div className="flex gap-2">
                <Select
                  value={item.status}
                  onValueChange={(v) =>
                    updateStatus.mutate({ id: item.id, status: v as any })
                  }
                >
                  <SelectTrigger className="flex-1">
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
            </div>
          )}

          <AttachmentsField
            registrationId={item.id}
            items={attachments}
            canManage={canManage || item.status === "aguardando"}
          />

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onGenerateSimulation(item)}
            disabled={!attachments.length || item.status !== "realizado"}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Gerar proposta a partir do print
          </Button>

          {/* Timeline */}
          <div>
            <div className="text-sm font-medium mb-2">Histórico</div>
            <ol className="space-y-2 border-l ml-2 pl-4">
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[1.4rem] top-1.5 w-2 h-2 rounded-full bg-primary" />
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(e.created_at), "dd/MM/yyyy HH:mm")} •{" "}
                    {e.changed_by_name || "Sistema"}
                  </div>
                  <div className="text-sm">
                    {e.from_status
                      ? `${statusLabel(e.from_status)} → ${statusLabel(e.to_status)}`
                      : `Criado como ${statusLabel(e.to_status)}`}
                  </div>
                </li>
              ))}
              {!events.length && (
                <li className="text-sm text-muted-foreground">Sem eventos.</li>
              )}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
