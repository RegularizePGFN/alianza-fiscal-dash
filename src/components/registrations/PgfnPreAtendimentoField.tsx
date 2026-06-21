import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2 } from "lucide-react";
import { useAutomationFiles, getAutomationFileUrl, AutomationFile } from "@/hooks/useAutomation";

interface Props {
  registrationId: string;
}

export function PgfnPreAtendimentoField({ registrationId }: Props) {
  const { data: files, isLoading } = useAutomationFiles(registrationId, { type: "pgfn_screenshot" });
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
    return () => { cancelled = true; };
  }, [files]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Verificando consulta PGFN...
      </div>
    );
  }

  if (!files || files.length === 0) return null;

  return (
    <div>
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-3.5 h-3.5 text-primary" />
        Print Pré-atendimento PGFN
      </Label>
      {loadingUrls ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 mt-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-3">
          {files.map((file: AutomationFile) => {
            const url = urls[file.id];
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                className="group relative overflow-hidden rounded-md border bg-muted/30 hover:ring-2 hover:ring-primary transition"
                title={file.file_name}
              >
                {url ? (
                  <img
                    src={url}
                    alt={file.file_name}
                    className="w-full object-contain max-h-64 group-hover:opacity-90 transition"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                  {file.file_name}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
