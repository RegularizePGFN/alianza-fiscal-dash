import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, Loader2, FileText, Download, Eye, RotateCw, CheckCheck, FileWarning, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientRegistration, AutomationStatus } from "@/hooks/useRegistrations";
import { useAutomationFiles, useAutomationRetry, getAutomationFileBlob } from "@/hooks/useAutomation";
import { toast } from "sonner";
import { PdfCanvasViewer } from "./PdfCanvasViewer";

interface Props {
  registration: ClientRegistration;
}

const STATUS_META: Record<AutomationStatus, { label: string; cls: string; Icon: any }> = {
  pending: {
    label: "Na fila",
    cls: "bg-muted text-muted-foreground border-border",
    Icon: Clock,
  },
  processing: {
    label: "Processando…",
    cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse",
    Icon: Loader2,
  },
  success: {
    label: "Sucesso",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    Icon: CheckCircle2,
  },
  error: {
    label: "Erro",
    cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Icon: AlertTriangle,
  },
  completed: {
    label: "Concluído",
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Icon: CheckCheck,
  },
  dados_incompletos: {
    label: "Dados incompletos",
    cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    Icon: FileWarning,
  },
  dados_invalidos: {
    label: "Dados inválidos",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Icon: FileWarning,
  },
};

const MOTHER_NAME_ERROR_CLS = "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";

function getMotherNameError(registration: ClientRegistration) {
  const err = (registration.automation_error || "").toUpperCase();
  if (err.includes("NOME DA MAE ERRADO") || err.includes("NOME MAE ERRADO")) {
    return "NOME MAE ERRADO";
  }
  return null;
}

export function AutomationStatusBadge({ registration }: Props) {
  const [open, setOpen] = useState(false);
  const [viewer, setViewer] = useState<{ data: Uint8Array; name: string; fileId: string } | null>(null);
  const status = registration.automation_status;
  const motherError = getMotherNameError(registration);
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.Icon;
  const clickable = status === "success" || status === "error" || status === "processing";

  const filesQ = useAutomationFiles(open && status === "success" ? registration.id : null);
  const retry = useAutomationRetry();

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const { blob, file_name } = await getAutomationFileBlob(fileId, fileName);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e: any) {
      toast.error(e.message || "Erro ao baixar");
    }
  };

  const handleView = async (fileId: string, fileName: string) => {
    try {
      const { blob, file_name } = await getAutomationFileBlob(fileId, fileName);
      const data = new Uint8Array(await blob.arrayBuffer());
      setViewer({ data, name: file_name, fileId });
    } catch (e: any) {
      toast.error(e.message || "Erro ao abrir");
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={!clickable}
        onClick={(e) => {
          e.stopPropagation();
          if (clickable) setOpen(true);
        }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${
          motherError ? MOTHER_NAME_ERROR_CLS : meta.cls
        } ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        <Icon className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`} />
        {motherError || meta.label}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-lg">
          {status === "success" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Cadastro concluído com sucesso
                </DialogTitle>
                <DialogDescription>
                  {registration.client_name || registration.cnpj || registration.cpf} — PDFs gerados pela automação:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {filesQ.isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
                {filesQ.data && filesQ.data.length === 0 && (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum PDF foi anexado pela automação.
                  </div>
                )}
                {filesQ.data?.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1 truncate" title={f.file_name}>
                      {f.file_name}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleView(f.id, f.file_name)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(f.id, f.file_name)}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Erro na automação
                </DialogTitle>
                <DialogDescription>
                  {registration.client_name || registration.cnpj || registration.cpf}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm whitespace-pre-wrap">
                {registration.automation_error || "Sem descrição do erro."}
              </div>
              <div className="text-xs text-muted-foreground">
                Tentativas: {registration.automation_attempts}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
                <Button
                  onClick={async () => {
                    await retry.mutateAsync(registration.id);
                    setOpen(false);
                  }}
                  disabled={retry.isPending}
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                  {retry.isPending ? "Reenviando…" : "Tentar novamente"}
                </Button>
              </DialogFooter>
            </>
          )}

          {status === "processing" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  Em processamento
                </DialogTitle>
                <DialogDescription>
                  A automação pegou esse cadastro e está processando. Se ficar travado, use "Forçar reenviar".
                </DialogDescription>
              </DialogHeader>
              <div className="text-xs text-muted-foreground">
                Iniciado em:{" "}
                {registration.automation_started_at
                  ? new Date(registration.automation_started_at).toLocaleString("pt-BR")
                  : "—"}
                <br />
                Tentativas: {registration.automation_attempts}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await retry.mutateAsync(registration.id);
                    setOpen(false);
                  }}
                  disabled={retry.isPending}
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                  Forçar reenviar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewer} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col gap-0"
        >
          <DialogHeader className="px-4 py-2 pr-12 border-b flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm font-medium truncate">{viewer?.name}</DialogTitle>
            <div className="flex items-center gap-2">
              {viewer && (
                <Button size="sm" variant="outline" onClick={() => handleDownload(viewer.fileId, viewer.name)}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Baixar
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            {viewer && <PdfCanvasViewer data={viewer.data} fileName={viewer.name} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
