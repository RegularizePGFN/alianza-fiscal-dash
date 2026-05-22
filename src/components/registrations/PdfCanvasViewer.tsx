import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfCanvasViewerProps {
  data: Uint8Array;
  fileName: string;
}

export function PdfCanvasViewer({ data, fileName }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const renderPdf = async () => {
      const container = containerRef.current;
      if (!container) return;

      setLoading(true);
      setError(null);
      container.replaceChildren();

      try {
        loadingTask = pdfjsLib.getDocument({ data: data.slice() });
        const pdf = await loadingTask.promise;
        const containerWidth = Math.max(container.clientWidth - 32, 320);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(containerWidth / baseViewport.width, 1.7);
          const viewport = page.getViewport({ scale });

          const pageWrap = document.createElement("div");
          pageWrap.className = "mx-auto mb-4 flex justify-center";

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Não foi possível renderizar o PDF");

          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className = "max-w-full rounded-md border bg-background shadow-sm";
          canvas.setAttribute("aria-label", `${fileName} — página ${pageNumber}`);

          pageWrap.appendChild(canvas);
          container.appendChild(pageWrap);

          await page.render({
            canvasContext: context,
            viewport,
            transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
          }).promise;
        }

        if (!cancelled) setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Erro ao carregar o PDF");
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [data, fileName]);

  return (
    <div className="relative h-full overflow-auto bg-muted/30 p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando PDF…
        </div>
      )}
      {error && (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-destructive">
          {error}
        </div>
      )}
      <div ref={containerRef} className={error ? "hidden" : "min-h-full"} />
    </div>
  );
}