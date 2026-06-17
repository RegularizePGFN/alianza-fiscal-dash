import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Check, X, Loader2, ChevronDown, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  ChatwootTestResult,
  useLastChatbotLead,
  useTestChatwootConnection,
  useTodayChatbotCount,
} from "@/hooks/useChatwootHealth";
import { toast } from "sonner";

function freshnessTone(date: Date | null): "success" | "warning" | "destructive" {
  if (!date) return "destructive";
  const hours = (Date.now() - date.getTime()) / 1000 / 3600;
  if (hours < 6) return "success";
  if (hours < 24) return "warning";
  return "destructive";
}

const toneClasses: Record<"success" | "warning" | "destructive", string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-destructive",
};

function LayerChip({
  label,
  ok,
  message,
}: {
  label: string;
  ok: boolean | null;
  message?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 font-medium",
          ok === true && "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
          ok === false && "border-destructive/40 text-destructive",
          ok === null && "text-muted-foreground",
        )}
      >
        {ok === true ? (
          <Check className="h-3.5 w-3.5" />
        ) : ok === false ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <span className="h-3.5 w-3.5" />
        )}
        {label}
      </Badge>
      {ok === false && message && (
        <span className="text-xs text-destructive max-w-[200px]">{message}</span>
      )}
    </div>
  );
}

export function ChatwootConnectionCard() {
  const { data: lastLead } = useLastChatbotLead();
  const { data: todayCount = 0 } = useTodayChatbotCount();
  const test = useTestChatwootConnection();
  const [result, setResult] = useState<ChatwootTestResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const tone = freshnessTone(lastLead ?? null);
  const lastLeadLabel = lastLead
    ? formatDistanceToNow(lastLead, { addSuffix: true, locale: ptBR })
    : "nenhum até agora";

  const handleTest = async () => {
    try {
      const r = await test.mutateAsync();
      setResult(r);
      if (r.overall === "ok") toast.success("Conexão Chatwoot OK");
      else toast.error("Falha no teste de conexão");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao testar conexão");
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", toneClasses[tone])} />
                <h3 className="font-semibold text-sm">Conexão Chatwoot</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Último lead via chatbot: <span className="font-medium text-foreground">{lastLeadLabel}</span>
                {" · "}Hoje: <span className="font-medium text-foreground">{todayCount}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <span className="text-xs text-muted-foreground">
                Última verificação:{" "}
                {new Date(result.tested_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <Button size="sm" onClick={handleTest} disabled={test.isPending}>
              {test.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Testando…
                </>
              ) : (
                "Testar conexão"
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="flex flex-wrap items-start gap-4 pt-2 border-t">
            <LayerChip label="Autenticação" ok={result.auth.ok} message={result.auth.message} />
            <LayerChip label="Extração CNPJ" ok={result.extraction.ok} message={result.extraction.message} />
            <LayerChip label="Gravação" ok={result.persistence.ok} message={result.persistence.message} />

            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="ml-auto">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver detalhes
                  <ChevronDown
                    className={cn(
                      "ml-1 h-3 w-3 transition-transform",
                      detailsOpen && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <pre className="text-[10px] bg-muted rounded p-2 max-w-[600px] overflow-auto">
                  {JSON.stringify(result.raw_response, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
