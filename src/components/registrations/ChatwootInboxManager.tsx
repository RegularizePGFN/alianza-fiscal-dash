import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";

interface ChatbotInbox {
  inbox_id: number;
  name: string;
  active: boolean;
}

export function ChatwootInboxManager() {
  const qc = useQueryClient();
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");

  const { data: inboxes = [], isLoading } = useQuery({
    queryKey: ["chatbot-inboxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_inboxes" as any)
        .select("*")
        .order("inbox_id");
      if (error) throw error;
      return (data ?? []) as unknown as ChatbotInbox[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["chatbot-inboxes"] });

  const toggle = useMutation({
    mutationFn: async ({ inbox_id, active }: { inbox_id: number; active: boolean }) => {
      const { error } = await supabase
        .from("chatbot_inboxes" as any)
        .update({ active })
        .eq("inbox_id", inbox_id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar"),
  });

  const remove = useMutation({
    mutationFn: async (inbox_id: number) => {
      const { error } = await supabase
        .from("chatbot_inboxes" as any)
        .delete()
        .eq("inbox_id", inbox_id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Caixa removida");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao remover"),
  });

  const add = useMutation({
    mutationFn: async () => {
      const id = parseInt(newId, 10);
      if (!Number.isFinite(id) || id <= 0) throw new Error("ID inválido");
      if (!newName.trim()) throw new Error("Nome obrigatório");
      const { error } = await supabase
        .from("chatbot_inboxes" as any)
        .insert({ inbox_id: id, name: newName.trim(), active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewId("");
      setNewName("");
      invalidate();
      toast.success("Caixa adicionada");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao adicionar"),
  });

  const updateName = useMutation({
    mutationFn: async ({ inbox_id, name }: { inbox_id: number; name: string }) => {
      const { error } = await supabase
        .from("chatbot_inboxes" as any)
        .update({ name })
        .eq("inbox_id", inbox_id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao renomear"),
  });

  return (
    <div className="pt-3 border-t space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Inbox className="h-4 w-4 text-muted-foreground" />
        Caixas de entrada ativas
        <span className="text-xs font-normal text-muted-foreground">
          (apenas caixas marcadas processam o cadastro automático)
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Carregando…
        </div>
      ) : inboxes.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhuma caixa cadastrada.</p>
      ) : (
        <div className="space-y-2">
          {inboxes.map((ib) => (
            <div
              key={ib.inbox_id}
              className="flex flex-wrap items-center gap-2 rounded-md border bg-card/40 p-2"
            >
              <span className="inline-flex items-center justify-center min-w-[2.5rem] h-6 rounded bg-muted text-xs font-mono">
                {ib.inbox_id}
              </span>
              <Input
                defaultValue={ib.name}
                className="h-7 text-sm flex-1 min-w-[160px]"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== ib.name) updateName.mutate({ inbox_id: ib.inbox_id, name: v });
                }}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={ib.active}
                  onCheckedChange={(v) => toggle.mutate({ inbox_id: ib.inbox_id, active: v })}
                />
                <Label className="text-xs text-muted-foreground">
                  {ib.active ? "Ativa" : "Inativa"}
                </Label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  if (confirm(`Remover caixa ${ib.inbox_id} (${ib.name})?`)) {
                    remove.mutate(ib.inbox_id);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Input
          type="number"
          placeholder="ID"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          className="h-8 w-24 text-sm"
        />
        <Input
          placeholder="Nome da caixa"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-8 text-sm flex-1 min-w-[160px]"
        />
        <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending}>
          {add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
