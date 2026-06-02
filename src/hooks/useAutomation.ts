import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AutomationFile {
  id: string;
  registration_id: string;
  file_path: string;
  file_name: string;
  uploaded_at: string;
}

export function useAutomationFiles(registrationId: string | null) {
  return useQuery({
    queryKey: ["automation-files", registrationId],
    enabled: !!registrationId,
    queryFn: async (): Promise<AutomationFile[]> => {
      const { data, error } = await supabase
        .from("client_registration_automation_files")
        .select("*")
        .eq("registration_id", registrationId!)
        .order("uploaded_at", { ascending: true });
      if (error) throw error;
      // Dedupe by file_path (fallback file_name), mantendo o mais recente
      const map = new Map<string, AutomationFile>();
      for (const f of (data || []) as AutomationFile[]) {
        const key = f.file_path || f.file_name;
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
    mutationFn: async (registration_id: string) => {
      // Update direto na tabela — RLS permite admin/backoffice/gestor e o próprio vendedor dono.
      const { error } = await supabase
        .from("client_registrations")
        .update({
          automation_status: "pending",
          automation_started_at: null,
          automation_finished_at: null,
          automation_error: null,
        })
        .eq("id", registration_id);
      if (error) throw error;
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Reenviado para a automação");
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

export async function getAutomationFileBlob(file_id: string, file_name: string): Promise<{ blob: Blob; file_name: string }> {
  const { data, error } = await supabase.functions.invoke("automation-file-url", {
    body: { file_id, mode: "download" },
  });
  if (error) throw error;
  if (!(data instanceof Blob)) throw new Error("Arquivo inválido retornado pela automação");
  return { blob: new Blob([data], { type: "application/pdf" }), file_name };
}
