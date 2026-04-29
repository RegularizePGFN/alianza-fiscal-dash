import React from 'react';
import { Loader2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AIProcessingPanelProps {
  processing: boolean;
  progressPercent: number;
  status: string;
  error?: string | null;
  imagePreview?: string | null;
}

const stages = [
  { key: 'upload', label: 'Carregando imagem', threshold: 5 },
  { key: 'analyze', label: 'Analisando com IA', threshold: 25 },
  { key: 'extract', label: 'Extraindo dados', threshold: 60 },
  { key: 'validate', label: 'Validando resultados', threshold: 90 },
];

const AIProcessingPanel: React.FC<AIProcessingPanelProps> = ({
  processing,
  progressPercent,
  status,
  error,
  imagePreview,
}) => {
  if (!processing && !imagePreview && !error) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Preview */}
      {imagePreview && (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="px-3 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Imagem enviada
          </div>
          <div className="p-3 bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center max-h-72 overflow-hidden">
            <img
              src={imagePreview}
              alt="Pré-visualização"
              className="max-h-64 max-w-full object-contain rounded-md shadow"
            />
          </div>
        </div>
      )}

      {/* Status */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-3 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-b flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Processamento com IA
        </div>
        <div className="p-4 space-y-4">
          {error ? (
            <div className="flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span>{status || 'Aguardando...'}</span>
                  <span className="font-semibold tabular-nums">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <ul className="space-y-2">
                {stages.map((stage) => {
                  const done = progressPercent > stage.threshold;
                  const active = !done && progressPercent >= stage.threshold - 10;
                  return (
                    <li key={stage.key} className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full border',
                          done && 'bg-success border-success text-success-foreground',
                          active && 'border-primary text-primary',
                          !done && !active && 'border-border text-muted-foreground',
                        )}
                      >
                        {done ? (
                          <Check className="h-3 w-3" />
                        ) : active ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <span
                        className={cn(
                          done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {stage.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProcessingPanel;
