import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Inbox, RefreshCw, BadgeCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  provider: string | null;
  phone_number: string | null;
}

interface LocalInbox {
  inbox_id: number;
  name: string;
  active: boolean;
}

function isOfficialChannel(inbox: ChatwootInbox) {
  return inbox.provider === "whatsapp_cloud";
}

function channelShortLabel(inbox: ChatwootInbox) {
  if (inbox.provider) {
    if (inbox.provider === "whatsapp_cloud") return "WhatsApp Cloud";
    if (inbox.provider === "waha") return "WAHA";
    return inbox.provider;
  }
  return inbox.channel_type?.replace(/^Channel::/, "") ?? "—";
}

export function ChatwootInboxManager() {
  const qc = useQueryClient();

  const localQuery = useQuery({
    queryKey: ["chatbot-inboxes-local"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_inboxes" as any)
        .select("inbox_id, name, active");
      if (error) throw error;
      return (data ?? []) as unknown as LocalInbox[];
    },
  });

  const remoteQuery = useQuery({
    queryKey: ["chatwoot-remote-inboxes"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("chatwoot-list-inboxes");
      if (error) throw new Error(error.message);
      if (data?.error) {
        throw new Error(data.message ?? data.error);
      }
      return (data?.inboxes ?? []) as ChatwootInbox[];
    },
  });

  const localById = useMemo(() => {
    const map = new Map<number, LocalInbox>();
    (localQuery.data ?? []).forEach((l) => map.set(l.inbox_id, l));
    return map;
  }, [localQuery.data]);

  const toggle = useMutation({
    mutationFn: async ({
      inbox,
      active,
    }: {
      inbox: ChatwootInbox;
      active: boolean;
    }) => {
      const existing = localById.get(inbox.id);
      if (existing) {
        const { error } = await supabase
          .from("chatbot_inboxes" as any)
          .update({ active, name: inbox.name })
          .eq("inbox_id", inbox.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("chatbot_inboxes" as any)
          .insert({ inbox_id: inbox.id, name: inbox.name, active });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chatbot-inboxes-local"] }),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar"),
  });

  const inboxes = remoteQuery.data ?? [];
  const activeCount = inboxes.filter((ib) => localById.get(ib.id)?.active).length;

  const handleRefresh = async () => {
    await Promise.all([remoteQuery.refetch(), localQuery.refetch()]);
    toast.success("Lista atualizada");
  };

  return (
    <div className="pt-3 border-t space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            Caixas de entrada ativas
          </div>
          <p className="text-xs text-muted-foreground">
            apenas caixas marcadas processam o cadastro automático
          </p>
          {!remoteQuery.isLoading && !remoteQuery.isError && (
            <p className="text-xs text-muted-foreground">
              {activeCount} de {inboxes.length} caixas ativas
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={handleRefresh}
          disabled={remoteQuery.isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${remoteQuery.isFetching ? "animate-spin" : ""}`} />
          Atualizar caixas
        </Button>
      </div>

      {remoteQuery.isLoading || localQuery.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : remoteQuery.isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p>{(remoteQuery.error as Error)?.message ?? "Falha ao carregar caixas do Chatwoot"}</p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => remoteQuery.refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : inboxes.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma caixa encontrada no Chatwoot.</p>
      ) : (
        <div className="space-y-2">
          {inboxes.map((ib) => {
            const local = localById.get(ib.id);
            const isActive = !!local?.active;
            const official = isOfficialChannel(ib.channel_type);
            return (
              <div
                key={ib.id}
                className={`flex flex-wrap items-center gap-3 rounded-md border p-2.5 transition-colors ${
                  isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"
                }`}
              >
                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-6 px-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">
                  {ib.id}
                </span>
                <div className="flex-1 min-w-[160px] flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{ib.name}</span>
                  {official ? (
                    <Badge variant="secondary" className="h-5 gap-1 text-[10px] font-normal">
                      <BadgeCheck className="h-3 w-3" />
                      Oficial
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-5 text-[10px] font-normal text-muted-foreground">
                      {channelShortLabel(ib.channel_type)}
                    </Badge>
                  )}
                  {ib.phone_number && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {ib.phone_number}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {isActive ? "Ativa" : "Inativa"}
                  </span>
                  <Switch
                    checked={isActive}
                    disabled={toggle.isPending}
                    onCheckedChange={(v) => toggle.mutate({ inbox: ib, active: v })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
