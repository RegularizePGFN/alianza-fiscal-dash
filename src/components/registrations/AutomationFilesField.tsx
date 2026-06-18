import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useAutomationFiles,
  getAutomationFileUrl,
  getAutomationFileBlob,
  AutomationFile,
} from "@/hooks/useAutomation";

interface Props {
  registrationId: string;
}

export function AutomationFilesField({ registrationId }: Props) {
  const { data: files, isLoading } = useAutomationFiles(registrationId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyMode, setBusyMode] = useState<"view" | "download" | null>(null);

  if (isLoading || !files || files.length === 0) return null;

  const handleView = async (file: AutomationFile) => {
    setBusyId(file.id);
    setBusyMode("view");
    try {
      const { url } = await getAutomationFileUrl(file.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao abrir arquivo");
    } finally {
      setBusyId(null);
      setBusyMode(null);
    }
  };

  const handleDownload = async (file: AutomationFile) => {
    setBusyId(file.id);
    setBusyMode("download");
    try {
      const { blob, file_name } = await getAutomationFileBlob(file.id, file.file_name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao baixar arquivo");
    } finally {
      setBusyId(null);
      setBusyMode(null);
    }
  };

  return (
    <div>
      <Label className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Relatório PGFN (gerado automaticamente)
      </Label>
      <div className="mt-2 flex flex-col gap-2">
        {files.map((file) => {
          const isBusy = busyId === file.id;
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-md border bg-muted/30"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(file.uploaded_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(file)}
                  disabled={isBusy}
                >
                  {isBusy && busyMode === "view" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline ml-1">Visualizar</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  disabled={isBusy}
                >
                  {isBusy && busyMode === "download" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline ml-1">Baixar</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
