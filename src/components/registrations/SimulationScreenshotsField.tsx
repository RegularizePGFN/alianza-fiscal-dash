import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon, Loader2, AlertTriangle, Clock, Trash2, CheckSquare, X } from "lucide-react";
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
        Prints da Simulação PGFN (automação RPA)
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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<null | "selected" | "all">(null);
  const deleteMut = useDeleteAutomationFile();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando prints...
      </div>
    );
  }

  if (!files || files.length === 0) {
    return <div className="text-sm text-muted-foreground p-3">Nenhum print recebido.</div>;
  }


  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = selected.size === files.length;
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(files.map((f) => f.id)));
  };

  const runBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await deleteMut.mutateAsync(id).catch(() => {});
    }
    setSelected(new Set());
    setSelectMode(false);
    setBulkConfirm(null);
  };

  const targetIds = bulkConfirm === "all" ? files.map((f) => f.id) : Array.from(selected);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-muted-foreground">
          {selectMode
            ? `${selected.size} de ${files.length} selecionado(s)`
            : `${files.length} print(s)`}
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button type="button" size="sm" variant="outline" onClick={toggleAll}>
                {allSelected ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={selected.size === 0 || deleteMut.isPending}
                onClick={() => setBulkConfirm("selected")}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Excluir selecionados
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectMode(false);
                  setSelected(new Set());
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setSelectMode(true)}>
                <CheckSquare className="w-3.5 h-3.5 mr-1" />
                Selecionar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={deleteMut.isPending}
                onClick={() => setBulkConfirm("all")}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Excluir todos
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {files.map((file: AutomationFile) => (
          <ScreenshotCard
            key={file.id}
            file={file}
            selectMode={selectMode}
            checked={selected.has(file.id)}
            onToggle={() => toggle(file.id)}
          />
        ))}
      </div>

      <AlertDialog open={bulkConfirm !== null} onOpenChange={(o) => !o && setBulkConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkConfirm === "all"
                ? `Excluir todos os ${files.length} prints?`
                : `Excluir ${targetIds.length} print(s) selecionado(s)?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                runBulkDelete(targetIds);
              }}
              disabled={deleteMut.isPending || targetIds.length === 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ScreenshotCard({
  file,
  selectMode,
  checked,
  onToggle,
}: {
  file: AutomationFile;
  selectMode: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const deleteMut = useDeleteAutomationFile();

  const handleOpen = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const { url } = await getAutomationFileUrl(file.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // noop
    } finally {
      setOpening(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-md border bg-muted/30 aspect-video transition ${
        selectMode && checked ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          if (selectMode) onToggle();
          else handleOpen();
        }}
        className="w-full h-full block"
        title={file.file_name}
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
          {opening ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImageIcon className="w-6 h-6" />
          )}
          <span className="text-[10px]">{opening ? "Abrindo..." : "Abrir print"}</span>
        </div>
      </button>


      {selectMode && (
        <div className="absolute top-1.5 left-1.5 z-10 bg-background/90 rounded p-1 shadow">
          <Checkbox checked={checked} onCheckedChange={onToggle} />
        </div>
      )}

      {!selectMode && (
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
      )}

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
