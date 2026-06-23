import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AutomationFileType = "pdf" | "screenshot" | "pgfn_screenshot";

export interface AutomationFile {
  id: string;
  registration_id: string;
  file_path: string;
  file_name: string;
  uploaded_at: string;
  file_type: AutomationFileType;
}

export function useAutomationFiles(
  registrationId: string | null,
  options: { type?: AutomationFileType } = {}
) {
  const type = options.type ?? "pdf";
  return useQuery({
    queryKey: ["automation-files", registrationId, type],
    enabled: !!registrationId,
    queryFn: async (): Promise<AutomationFile[]> => {
      const { data, error } = await supabase
        .from("client_registration_automation_files")
        .select("*")
        .eq("registration_id", registrationId!)
        .eq("file_type", type)
        .order("uploaded_at", { ascending: true });
      if (error) throw error;
      // Dedupe por file_name (mesmo arquivo reenviado gera paths diferentes), mantendo o mais recente
      const map = new Map<string, AutomationFile>();
      for (const f of (data || []) as AutomationFile[]) {
        const key = (f.file_name || f.file_path).trim().toLowerCase();
        const prev = map.get(key);
        if (!prev || new Date(f.uploaded_at) >= new Date(prev.uploaded_at)) {
          map.set(key, f);
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
      );
    },
  });
}

export function useAutomationRetry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: string | { registration_id: string; mother_name?: string }
    ) => {
      const params =
        typeof input === "string" ? { registration_id: input } : input;
      const motherName = params.mother_name?.trim();
      const updates: Record<string, any> = {
        automation_status: "pending",
        automation_started_at: null,
        automation_finished_at: null,
        automation_error: null,
      };
      if (motherName) {
        updates.mother_name = motherName.toUpperCase();
      }
      const { error } = await supabase
        .from("client_registrations")
        .update(updates)
        .eq("id", params.registration_id);
      if (error) throw error;
      return { ok: true, corrected: !!motherName };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      toast.success(
        res.corrected
          ? "Nome da mãe atualizado — cadastro recolocado na fila"
          : "Reenviado para a automação"
      );
    },
    onError: (e: any) => toast.error(e.message || "Erro ao reenviar"),
  });
}

export async function getAutomationFileUrl(file_id: string): Promise<{ url: string; file_name: string }> {
  const { data, error } = await supabase.functions.invoke("automation-file-url", {
    body: { file_id },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { url: string; file_name: string };
}

export async function getAutomationFileUrlsBatch(
  file_ids: string[]
): Promise<Array<{ id: string; url: string; file_name: string }>> {
  if (file_ids.length === 0) return [];
  const { data, error } = await supabase.functions.invoke("automation-file-url", {
    body: { file_ids },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return ((data as any)?.files ?? []) as Array<{ id: string; url: string; file_name: string }>;
}

export async function getAutomationFileBlob(file_id: string, file_name: string): Promise<{ blob: Blob; file_name: string }> {
  const { data, error } = await supabase.functions.invoke("automation-file-url", {
    body: { file_id, mode: "download" },
  });
  if (error) throw error;
  if (!(data instanceof Blob)) throw new Error("Arquivo inválido retornado pela automação");
  return { blob: new Blob([data], { type: "application/pdf" }), file_name };
}

export function useDeleteAutomationFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file_id: string) => {
      const { data, error } = await supabase.functions.invoke("automation-file-delete", {
        body: { file_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-files"] });
      toast.success("Print excluído");
    },
    onError: (e: any) => toast.error(e?.message || "Erro ao excluir print"),
  });
}
