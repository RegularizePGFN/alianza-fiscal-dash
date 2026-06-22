import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { useAutomationFiles, getAutomationFileUrl, useDeleteAutomationFile, AutomationFile } from "@/hooks/useAutomation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  registrationId: string;
  simulationStatus: "success" | "no_debts" | "error" | "pending" | null | undefined;
}

export function SimulationScreenshotsField({ registrationId, simulationStatus }: Props) {
  if (!simulationStatus) return null;

  return (
    <div>
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5 text-primary" />
        Prints da Simulação PGFN
      </Label>
      <div className="mt-2">
        {simulationStatus === "success" && <ScreenshotsGallery registrationId={registrationId} />}
        {simulationStatus === "no_debts" && (
          <div className="flex items-start gap-2 p-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Contribuinte sem dívidas negociáveis no SISPAR.
          </div>
        )}
        {(simulationStatus === "error" || simulationStatus === "pending") && (
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            Simulação pendente.
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenshotsGallery({ registrationId }: { registrationId: string }) {
  const { data: files, isLoading } = useAutomationFiles(registrationId, { type: "screenshot" });
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  useEffect(() => {
    if (!files || files.length === 0) return;
    let cancelled = false;
    setLoadingUrls(true);
    Promise.all(
      files.map(async (f) => {
        try {
          const { url } = await getAutomationFileUrl(f.id);
          return [f.id, url] as const;
        } catch {
          return [f.id, ""] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setUrls(Object.fromEntries(entries));
      setLoadingUrls(false);
    });
    return () => {
      cancelled = true;
    };
  }, [files]);

  if (isLoading || loadingUrls) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando prints...
      </div>
    );
  }

  if (!files || files.length === 0) {
    return <div className="text-sm text-muted-foreground p-3">Nenhum print recebido.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {files.map((file: AutomationFile) => (
        <ScreenshotCard key={file.id} file={file} url={urls[file.id]} />
      ))}
    </div>
  );
}

function ScreenshotCard({ file, url }: { file: AutomationFile; url?: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMut = useDeleteAutomationFile();

  return (
    <div className="group relative overflow-hidden rounded-md border bg-muted/30 aspect-video hover:ring-2 hover:ring-primary transition">
      <button
        type="button"
        onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
        className="w-full h-full block"
        title={file.file_name}
      >
        {url ? (
          <img
            src={url}
            alt={file.file_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        disabled={deleteMut.isPending}
        className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition disabled:opacity-50"
        title="Excluir print"
        aria-label="Excluir print"
      >
        {deleteMut.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate pointer-events-none">
        {file.file_name}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir print de simulação?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir este print de simulação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMut.mutate(file.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
