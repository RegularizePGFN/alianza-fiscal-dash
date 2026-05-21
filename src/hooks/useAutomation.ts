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
      return (data || []) as AutomationFile[];
    },
  });
}

export function useAutomationRetry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (registration_id: string) => {
      const { data, error } = await supabase.functions.invoke("automation-retry", {
        body: { registration_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
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

export async function getAutomationFileBlob(file_id: string): Promise<{ blob: Blob; file_name: string }> {
  const urlData = await getAutomationFileUrl(file_id);
  const { data, error } = await supabase.functions.invoke("automation-file-url", {
    body: { file_id, mode: "download" },
  });
  if (error) throw error;
  if (!(data instanceof Blob)) throw new Error("Arquivo inválido retornado pela automação");
  return { blob: new Blob([data], { type: "application/pdf" }), file_name: urlData.file_name };
}
